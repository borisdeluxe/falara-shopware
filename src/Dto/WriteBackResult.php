<?php declare(strict_types=1);

namespace Falara\TranslationManager\Dto;

class WriteBackResult
{
    public function __construct(
        public readonly int $written,
        public readonly int $skipped,
        public readonly array $errors,
    ) {}

    public static function fromImportResult(ImportResult $result): self
    {
        return new self(
            written: $result->written,
            skipped: $result->skipped,
            errors: $result->errors,
        );
    }
}
