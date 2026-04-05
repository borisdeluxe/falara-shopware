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

        $texts    = [];
        $warnings = [];

        foreach ($pages as $page) {
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
                                'text'     => (string) $value,
                                'metadata' => [
                                    'entity_id'   => $page->getId(),
                                    'entity_type' => $this->getType(),
                                    'field'       => sprintf('slot.%s.%s', $slot->getId(), $key),
                                    'slot_id'     => $slot->getId(),
                                    'slot_type'   => $slot->getType(),
                                    'config_key'  => $key,
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

        }

        return ['texts' => $texts, 'warnings' => $warnings];
    }

    /**
     * CMS slot write-back is not yet implemented.
     * All items are returned as skipped with an appropriate error code.
     */
    public function import(array $translations, string $targetLanguageId, Context $context): ImportResult
    {
        $result = new ImportResult();

        foreach ($translations as $translation) {
            $entityId = $translation['entity_id'] ?? 'unknown';
            $field    = $translation['field'] ?? '';

            $result->addError(
                $entityId,
                $this->getType(),
                $field,
                ErrorCode::CMS_SLOT_SKIPPED->value,
                'CMS slot write-back not yet implemented',
            );
            $result->skipped++;
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
