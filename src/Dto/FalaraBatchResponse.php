<?php declare(strict_types=1);

namespace Falara\TranslationManager\Dto;

class FalaraBatchResponse
{
    public function __construct(
        public readonly ?string $batchId,
        public readonly array $jobs,
    ) {}

    public static function fromArray(array $data): self
    {
        if (array_key_exists('batch_id', $data)) {
            return new self(
                batchId: $data['batch_id'],
                jobs: $data['jobs'] ?? [],
            );
        }

        $jobId = $data['job_id'] ?? null;
        if ($jobId === null || $jobId === '') {
            throw new \InvalidArgumentException('FalaraBatchResponse: job_id must not be null or empty when batch_id is absent.');
        }

        return new self(
            batchId: null,
            jobs: [['job_id' => $jobId]],
        );
    }
}
