<?php declare(strict_types=1);

namespace Falara\TranslationManager\Dto;

class ImportResult
{
    public int $written = 0;
    public int $skipped = 0;
    public array $errors = [];

    public function addError(
        string $entityId,
        string $entityType,
        string $field,
        string $code,
        string $message,
    ): void {
        $this->errors[] = [
            'entity_id'   => $entityId,
            'entity_type' => $entityType,
            'field'       => $field,
            'code'        => $code,
            'message'     => $message,
        ];
    }

    public function merge(self $other): void
    {
        $this->written += $other->written;
        $this->skipped += $other->skipped;
        $this->errors   = array_merge($this->errors, $other->errors);
    }
}
