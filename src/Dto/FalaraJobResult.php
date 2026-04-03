<?php declare(strict_types=1);

namespace Falara\TranslationManager\Dto;

class FalaraJobResult
{
    public function __construct(
        public readonly string $jobId,
        public readonly array $translations,
        public readonly ?float $qaScore,
        public readonly int $billedWords,
    ) {}

    public static function fromArray(array $data): self
    {
        if (isset($data['translated_text'])) {
            $translations = $data['translated_text'];
        } elseif (isset($data['translation'])) {
            $translations = $data['translation'];
        } else {
            $translations = [];
        }

        if (!is_array($translations)) {
            $translations = [$translations];
        }

        return new self(
            jobId: $data['job_id'] ?? '',
            translations: $translations,
            qaScore: isset($data['qa_score']) ? (float) $data['qa_score'] : null,
            billedWords: (int) ($data['billed_words'] ?? 0),
        );
    }
}
