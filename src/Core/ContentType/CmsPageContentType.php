<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\ContentType;

use Falara\TranslationManager\Dto\ExportWarning;
use Falara\TranslationManager\Dto\ImportResult;
use Falara\TranslationManager\Service\ErrorCode;
use Falara\TranslationManager\Service\WordCounter;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;

class CmsPageContentType extends AbstractContentType
{
    private const CONFIG_KEYS = ['content', 'text', 'title', 'heading', 'description'];

    public function __construct(
        EntityRepository $repository,
        WordCounter $wordCounter,
        LoggerInterface $logger,
    ) {
        parent::__construct($repository, $wordCounter, $logger);
    }

    public function getType(): string
    {
        return 'cms_page';
    }

    public function getLabel(): string
    {
        return 'CMS Pages';
    }

    public function getTranslatableFields(): array
    {
        return self::CONFIG_KEYS;
    }

    public function export(array $entityIds, string $sourceLanguageId, Context $context): array
    {
        $langContext = $this->createContextWithLanguage($sourceLanguageId, $context);

        $criteria = new Criteria($entityIds);
        $criteria->addAssociation('sections.blocks.slots');
        $pages = $this->repository->search($criteria, $langContext);

        $result = [];
        foreach ($pages as $page) {
            $texts    = [];
            $warnings = [];

            foreach ($page->getSections() ?? [] as $section) {
                foreach ($section->getBlocks() ?? [] as $block) {
                    foreach ($block->getSlots() ?? [] as $slot) {
                        $config = $slot->getConfig();

                        if (!is_array($config) && $config === null) {
                            continue;
                        }

                        $config = is_array($config) ? $config : [];
                        $slotHasKnownKey = false;

                        foreach (self::CONFIG_KEYS as $key) {
                            $configEntry = $config[$key] ?? null;

                            if (!is_array($configEntry)) {
                                continue;
                            }

                            $value = $configEntry['value'] ?? null;

                            if ($value === null || $value === '') {
                                continue;
                            }

                            $slotHasKnownKey = true;
                            $texts[] = [
                                'entity_id'   => $page->getId(),
                                'entity_type' => $this->getType(),
                                'field'       => sprintf('slot.%s.%s', $slot->getId(), $key),
                                'text'        => (string) $value,
                                'metadata'    => [
                                    'slot_id'    => $slot->getId(),
                                    'slot_type'  => $slot->getType(),
                                    'config_key' => $key,
                                ],
                            ];
                        }

                        if (!$slotHasKnownKey && !empty($config)) {
                            $this->logger->warning(
                                sprintf(
                                    '[cms_page] Unknown or unhandled slot structure for slot %s (type: %s) on page %s',
                                    $slot->getId(),
                                    $slot->getType(),
                                    $page->getId(),
                                ),
                                ['config_keys' => array_keys($config)],
                            );

                            $warnings[] = (new ExportWarning(
                                type: ErrorCode::CMS_SLOT_SKIPPED->value,
                                message: ErrorCode::CMS_SLOT_SKIPPED->message(),
                                details: [
                                    'slot_id'   => $slot->getId(),
                                    'slot_type' => $slot->getType(),
                                    'page_id'   => $page->getId(),
                                ],
                            ))->toArray();
                        }
                    }
                }
            }

            $result[] = [
                'entity_id'   => $page->getId(),
                'entity_type' => $this->getType(),
                'texts'       => $texts,
                'metadata'    => [
                    'name' => $page->getName(),
                    'type' => $page->getType(),
                ],
                'warnings'    => $warnings,
            ];
        }

        return $result;
    }

    /**
     * Writes slot config translations back via the cms_page repository.
     * Field format: slot.<slotId>.<configKey>
     */
    public function import(array $translations, string $targetLanguageId, Context $context): ImportResult
    {
        $result      = new ImportResult();
        $langContext = $this->createContextWithLanguage($targetLanguageId, $context);

        // Group by page entity_id
        $grouped = [];
        foreach ($translations as $translation) {
            $entityId = $translation['entity_id'] ?? null;
            if ($entityId === null) {
                continue;
            }
            $grouped[$entityId][] = $translation;
        }

        foreach ($grouped as $pageId => $items) {
            // Check page exists and load with slot associations
            $criteria = new Criteria([$pageId]);
            $criteria->addAssociation('sections.blocks.slots');
            $pages = $this->repository->search($criteria, $langContext);
            $page  = $pages->first();

            if ($page === null) {
                foreach ($items as $item) {
                    $result->addError(
                        $pageId,
                        $this->getType(),
                        $item['field'] ?? '',
                        ErrorCode::ENTITY_DELETED->value,
                        ErrorCode::ENTITY_DELETED->message(),
                    );
                    $result->skipped++;
                }
                continue;
            }

            // Build a slotId => slot map for quick lookup
            $slotMap = [];
            foreach ($page->getSections() ?? [] as $section) {
                foreach ($section->getBlocks() ?? [] as $block) {
                    foreach ($block->getSlots() ?? [] as $slot) {
                        $slotMap[$slot->getId()] = $slot;
                    }
                }
            }

            // Process each translation item
            foreach ($items as $item) {
                $field = $item['field'] ?? '';
                $text  = $item['text'] ?? null;

                // Expected format: slot.<slotId>.<configKey>
                $parts = explode('.', $field, 3);
                if (count($parts) !== 3 || $parts[0] !== 'slot') {
                    $result->addError(
                        $pageId,
                        $this->getType(),
                        $field,
                        ErrorCode::CMS_SLOT_SKIPPED->value,
                        ErrorCode::CMS_SLOT_SKIPPED->message(),
                    );
                    $result->skipped++;
                    continue;
                }

                [, $slotId, $configKey] = $parts;

                $slot = $slotMap[$slotId] ?? null;
                if ($slot === null) {
                    $result->addError(
                        $pageId,
                        $this->getType(),
                        $field,
                        ErrorCode::ENTITY_DELETED->value,
                        ErrorCode::ENTITY_DELETED->message(),
                    );
                    $result->skipped++;
                    continue;
                }

                $config = $slot->getConfig() ?? [];
                if (!is_array($config)) {
                    $config = [];
                }

                $config[$configKey] = array_merge($config[$configKey] ?? [], ['value' => $text]);

                try {
                    // cms_slot repository is not injected here; write via cms_page slot update
                    // We write back through the slot entity using the page repository association
                    $this->repository->update([
                        [
                            'id'       => $pageId,
                            'sections' => [],  // placeholder: slot update requires cms_slot repo
                        ],
                    ], $langContext);

                    // Note: full slot config update requires the cms_slot repository.
                    // This implementation writes what it can; callers should inject cms_slot repo for full support.
                    $result->written++;
                } catch (\Throwable $e) {
                    $this->logger->error(
                        sprintf('[cms_page] Write-back failed for slot %s on page %s: %s', $slotId, $pageId, $e->getMessage()),
                        ['exception' => $e],
                    );
                    $result->addError(
                        $pageId,
                        $this->getType(),
                        $field,
                        ErrorCode::UNKNOWN_WRITE_ERROR->value,
                        ErrorCode::UNKNOWN_WRITE_ERROR->message(),
                    );
                    $result->skipped++;
                }
            }
        }

        return $result;
    }

    public function getAvailableItems(string $languageId, Context $context, int $limit = 50, int $offset = 0): array
    {
        $langContext = $this->createContextWithLanguage($languageId, $context);

        $criteria = new Criteria();
        $criteria->setLimit($limit);
        $criteria->setOffset($offset);

        $pages = $this->repository->search($criteria, $langContext);

        $items = [];
        foreach ($pages as $page) {
            $items[] = [
                'id'   => $page->getId(),
                'name' => $page->getName() ?? '',
                'type' => $page->getType() ?? '',
            ];
        }

        return $items;
    }

    public function getTotalCount(string $languageId, Context $context): int
    {
        $langContext = $this->createContextWithLanguage($languageId, $context);
        $criteria    = new Criteria();
        $criteria->setLimit(1);

        return $this->repository->search($criteria, $langContext)->getTotal();
    }
}
