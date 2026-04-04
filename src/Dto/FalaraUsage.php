<?php declare(strict_types=1);

namespace Falara\TranslationManager\Dto;

class FalaraUsage
{
    public function __construct(
        public readonly int $wordsUsed,
        public readonly int $wordsLimit,
        public readonly int $wordsRemaining,
        public readonly string $plan = '',
        public readonly int $bonusWordsAvailable = 0,
    ) {}

    public static function fromArray(array $data): self
    {
        $used = $data['words_used_this_period'] ?? $data['words_used'] ?? 0;
        $limit = $data['words_limit'] ?? 0;
        $remaining = $limit - $used;
        if ($remaining < 0) $remaining = 0;

        return new self(
            wordsUsed: (int) $used,
            wordsLimit: (int) $limit,
            wordsRemaining: (int) $remaining,
            plan: $data['plan'] ?? '',
            bonusWordsAvailable: (int) ($data['bonus_words_available'] ?? 0),
        );
    }

    public function isExhausted(): bool
    {
        return $this->wordsRemaining <= 0;
    }

    public function getPercentUsed(): float
    {
        if ($this->wordsLimit === 0) {
            return 0.0;
        }
        return round(($this->wordsUsed / $this->wordsLimit) * 100, 1);
    }
}
