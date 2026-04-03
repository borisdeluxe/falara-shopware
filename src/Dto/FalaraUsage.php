<?php declare(strict_types=1);

namespace Falara\TranslationManager\Dto;

class FalaraUsage
{
    public function __construct(
        public readonly int $wordsUsed,
        public readonly int $wordsLimit,
        public readonly int $wordsRemaining,
    ) {}

    public function isExhausted(): bool
    {
        return $this->wordsRemaining <= 0;
    }

    public function getPercentUsed(): float
    {
        if ($this->wordsLimit === 0) {
            return 0.0;
        }

        return round(($this->wordsUsed / $this->wordsLimit) * 100, 2);
    }

    public static function fromArray(array $data): self
    {
        return new self(
            wordsUsed: (int) ($data['words_used'] ?? 0),
            wordsLimit: (int) ($data['words_limit'] ?? 0),
            wordsRemaining: (int) ($data['words_remaining'] ?? 0),
        );
    }
}
