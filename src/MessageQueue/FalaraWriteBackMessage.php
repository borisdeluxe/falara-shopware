<?php declare(strict_types=1);

namespace Falara\TranslationManager\MessageQueue;

class FalaraWriteBackMessage
{
    public function __construct(
        private readonly string $jobId,
        private readonly string $salesChannelId,
    ) {}

    public function getJobId(): string
    {
        return $this->jobId;
    }

    public function getSalesChannelId(): string
    {
        return $this->salesChannelId;
    }
}
