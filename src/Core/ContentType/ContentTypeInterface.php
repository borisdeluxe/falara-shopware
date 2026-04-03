<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\ContentType;

use Falara\TranslationManager\Dto\ImportResult;
use Shopware\Core\Framework\Context;

interface ContentTypeInterface
{
    public function getType(): string;
    public function getLabel(): string;
    public function getTranslatableFields(): array;
    public function export(array $entityIds, string $sourceLanguageId, Context $context): array;
    public function import(array $translations, string $targetLanguageId, Context $context): ImportResult;
    public function getAvailableItems(string $languageId, Context $context, int $limit = 50, int $offset = 0): array;
    public function getTotalCount(string $languageId, Context $context): int;
}
