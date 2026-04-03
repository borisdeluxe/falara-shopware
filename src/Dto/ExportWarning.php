<?php declare(strict_types=1);

namespace Falara\TranslationManager\Dto;

class ExportWarning
{
    public function __construct(
        public readonly string $type,
        public readonly string $message,
        public readonly array $details = [],
    ) {}

    public function toArray(): array
    {
        return [
            'type'    => $this->type,
            'message' => $this->message,
            'details' => $this->details,
        ];
    }
}
