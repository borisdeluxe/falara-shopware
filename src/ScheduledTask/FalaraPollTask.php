<?php declare(strict_types=1);

namespace Falara\TranslationManager\ScheduledTask;

use Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTask;

class FalaraPollTask extends ScheduledTask
{
    public static function getTaskName(): string
    {
        return 'falara.poll_jobs';
    }

    public static function getDefaultInterval(): int
    {
        return 300;
    }
}
