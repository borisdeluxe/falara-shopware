<?php declare(strict_types=1);

namespace Falara\TranslationManager\Dto;

class FalaraJobStatus
{
    private const TERMINAL_STATUSES = [
        'completed',
        'completed_with_blocks',
        'needs_review',
        'failed',
        'dead',
    ];

    public function __construct(
        public readonly string $jobId,
        public readonly string $status,
        public readonly ?string $currentStep,
        public readonly ?float $qaScore,
    ) {}

    public function isTerminal(): bool
    {
        return in_array($this->status, self::TERMINAL_STATUSES, true);
    }

    public static function fromArray(array $data): self
    {
        return new self(
            jobId: $data['job_id'] ?? '',
            status: $data['status'] ?? '',
            currentStep: $data['current_step'] ?? null,
            qaScore: isset($data['qa_score']) ? (float) $data['qa_score'] : null,
        );
    }
}
