<?php declare(strict_types=1);

namespace Falara\TranslationManager\Service;

final class JobStatus
{
    public const PENDING = 'pending';
    public const QUEUED = 'queued';
    public const PROCESSING = 'processing';
    public const COMPLETED = 'completed';
    public const COMPLETED_WITH_BLOCKS = 'completed_with_blocks';
    public const NEEDS_REVIEW = 'needs_review';
    public const WRITING_BACK = 'writing_back';
    public const WRITTEN_BACK = 'written_back';
    public const WRITEBACK_FAILED = 'writeback_failed';
    public const FAILED = 'failed';
    public const DEAD = 'dead';

    public const IN_FLIGHT = [self::PENDING, self::PROCESSING, self::QUEUED];
    public const TERMINAL = [self::COMPLETED, self::COMPLETED_WITH_BLOCKS, self::NEEDS_REVIEW, self::FAILED, self::DEAD];
    public const WRITEBACK_ELIGIBLE = [self::COMPLETED, self::NEEDS_REVIEW, self::COMPLETED_WITH_BLOCKS];
    public const CLAIMABLE = [self::COMPLETED, self::NEEDS_REVIEW];
}
