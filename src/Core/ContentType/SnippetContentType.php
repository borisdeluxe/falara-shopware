<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\ContentType;

use Falara\TranslationManager\Dto\ImportResult;
use Falara\TranslationManager\Service\ErrorCode;
use Falara\TranslationManager\Service\WordCounter;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;

class SnippetContentType extends AbstractContentType
{
    public function __construct(
        EntityRepository $repository,
        WordCounter $wordCounter,
        LoggerInterface $logger,
    ) {
        parent::__construct($repository, $wordCounter, $logger);
    }

    public function getType(): string
    {
        return 'snippet';
    }

    public function getLabel(): string
    {
        return 'Snippets';
    }

    public function getTranslatableFields(): array
    {
        return ['value'];
    }

    public function export(array $entityIds, string $sourceLanguageId, Context $context): array
    {
        $criteria = new Criteria($entityIds);
        $criteria->addAssociation('set');
        $snippets = $this->repository->search($criteria, $context);

        // Group by snippet set
        $grouped = [];
        foreach ($snippets as $snippet) {
            $setId = $snippet->getSnippetSetId();
            if (!isset($grouped[$setId])) {
                $grouped[$setId] = [
                    'set_id'      => $setId,
                    'set_name'    => $snippet->getSet()?->getName() ?? $setId,
                    'snippets'    => [],
                ];
            }

            $grouped[$setId]['snippets'][] = [
                'entity_id'   => $snippet->getId(),
                'entity_type' => $this->getType(),
                'field'       => 'value',
                'text'        => $snippet->getValue(),
                'metadata'    => [
                    'key'    => $snippet->getTranslationKey(),
                    'set_id' => $setId,
                ],
            ];
        }

        $result = [];
        foreach ($grouped as $group) {
            $result[] = [
                'entity_id'   => $group['set_id'],
                'entity_type' => $this->getType(),
                'texts'       => $group['snippets'],
                'metadata'    => [
                    'set_id'   => $group['set_id'],
                    'set_name' => $group['set_name'],
                ],
            ];
        }

        return $result;
    }

    public function import(array $translations, string $targetLanguageId, Context $context): ImportResult
    {
        $result = new ImportResult();

        foreach ($translations as $translation) {
            $entityId = $translation['entity_id'] ?? null;
            $field    = $translation['field'] ?? 'value';
            $text     = $translation['text'] ?? null;

            if ($entityId === null || $text === null) {
                continue;
            }

            // Check snippet exists
            $criteria = new Criteria([$entityId]);
            $exists   = $this->repository->searchIds($criteria, $context)->firstId();

            if ($exists === null) {
                $result->addError(
                    $entityId,
                    $this->getType(),
                    $field,
                    ErrorCode::ENTITY_DELETED->value,
                    ErrorCode::ENTITY_DELETED->message(),
                );
                $result->skipped++;
                continue;
            }

            try {
                $this->repository->update([
                    [
                        'id'    => $entityId,
                        'value' => $text,
                    ],
                ], $context);
                $result->written++;
            } catch (\Throwable $e) {
                $this->logger->error(
                    sprintf('[snippet] Write-back failed for snippet %s: %s', $entityId, $e->getMessage()),
                    ['exception' => $e],
                );
                $result->addError(
                    $entityId,
                    $this->getType(),
                    $field,
                    ErrorCode::UNKNOWN_WRITE_ERROR->value,
                    ErrorCode::UNKNOWN_WRITE_ERROR->message(),
                );
                $result->skipped++;
            }
        }

        return $result;
    }

    public function getAvailableItems(string $languageId, Context $context, int $limit = 50, int $offset = 0): array
    {
        $criteria = new Criteria();
        $criteria->setLimit($limit);
        $criteria->setOffset($offset);
        $criteria->addAssociation('set');

        $snippets = $this->repository->search($criteria, $context);

        $items = [];
        foreach ($snippets as $snippet) {
            $items[] = [
                'id'        => $snippet->getId(),
                'key'       => $snippet->getTranslationKey(),
                'set_id'    => $snippet->getSnippetSetId(),
                'set_name'  => $snippet->getSet()?->getName() ?? '',
                'wordCount' => $this->wordCounter->count($snippet->getValue()),
            ];
        }

        return $items;
    }

    public function getTotalCount(string $languageId, Context $context): int
    {
        $criteria = new Criteria();
        $criteria->setLimit(1);

        return $this->repository->search($criteria, $context)->getTotal();
    }
}
