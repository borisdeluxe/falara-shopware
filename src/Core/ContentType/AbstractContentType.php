<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\ContentType;

use Falara\TranslationManager\Dto\ImportResult;
use Falara\TranslationManager\Service\ErrorCode;
use Falara\TranslationManager\Service\WordCounter;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsAnyFilter;

abstract class AbstractContentType implements ContentTypeInterface
{
    public function __construct(
        protected readonly EntityRepository $repository,
        protected readonly WordCounter $wordCounter,
        protected readonly LoggerInterface $logger,
    ) {}

    /**
     * Fields to skip during export (e.g. slugs/handles).
     */
    public function getSkipFields(): array
    {
        return [];
    }

    /**
     * Creates a Context with the given language as the first entry in the language chain.
     */
    protected function createContextWithLanguage(string $languageId, Context $context): Context
    {
        return new Context(
            $context->getSource(),
            $context->getRuleIds(),
            $context->getCurrencyId(),
            array_merge([$languageId], $context->getLanguageIdChain()),
            $context->getVersionId(),
            $context->getCurrencyFactor(),
            $context->considerInheritance(),
            $context->getTaxState(),
            $context->getRounding(),
        );
    }

    /**
     * Builds the texts[] array for export, skipping skip-fields and empty values.
     */
    protected function buildTexts(array $entity, string $entityId, string $entityType, array $fields): array
    {
        $skipFields = $this->getSkipFields();
        $texts = [];

        foreach ($fields as $field) {
            if (in_array($field, $skipFields, true)) {
                continue;
            }

            $value = $entity[$field] ?? null;

            if ($value === null || $value === '') {
                continue;
            }

            $texts[] = [
                'entity_id'   => $entityId,
                'entity_type' => $entityType,
                'field'       => $field,
                'text'        => (string) $value,
            ];
        }

        return $texts;
    }

    /**
     * Groups translations by entity_id, calls repository->update with translations array.
     * Catches exceptions and maps to ErrorCode.
     */
    public function import(array $translations, string $targetLanguageId, Context $context): ImportResult
    {
        $result  = new ImportResult();
        $context = $this->createContextWithLanguage($targetLanguageId, $context);

        // Group by entity_id
        $grouped = [];
        foreach ($translations as $translation) {
            $entityId = $translation['entity_id'] ?? null;
            if ($entityId === null) {
                continue;
            }
            $grouped[$entityId][] = $translation;
        }

        foreach ($grouped as $entityId => $items) {
            // Check entity exists
            $criteria = new Criteria([$entityId]);
            $exists   = $this->repository->searchIds($criteria, $context)->firstId();

            if ($exists === null) {
                foreach ($items as $item) {
                    $result->addError(
                        $entityId,
                        $this->getType(),
                        $item['field'] ?? '',
                        ErrorCode::ENTITY_DELETED->value,
                        ErrorCode::ENTITY_DELETED->message(),
                    );
                    $result->skipped++;
                }
                continue;
            }

            // Build translation payload
            $translationData = ['id' => $entityId];
            foreach ($items as $item) {
                $field = $item['field'] ?? null;
                $text  = $item['text'] ?? null;
                if ($field !== null && $text !== null) {
                    $translationData[$field] = $text;
                }
            }

            try {
                $this->repository->update([$translationData], $context);
                $result->written += count($items);
            } catch (\Throwable $e) {
                $this->logger->error(
                    sprintf('[%s] Write-back failed for entity %s: %s', $this->getType(), $entityId, $e->getMessage()),
                    ['exception' => $e, 'entity_id' => $entityId],
                );

                foreach ($items as $item) {
                    $result->addError(
                        $entityId,
                        $this->getType(),
                        $item['field'] ?? '',
                        ErrorCode::UNKNOWN_WRITE_ERROR->value,
                        ErrorCode::UNKNOWN_WRITE_ERROR->message(),
                    );
                    $result->skipped++;
                }
            }
        }

        return $result;
    }
}
