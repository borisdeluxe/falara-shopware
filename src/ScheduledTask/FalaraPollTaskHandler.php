<?php declare(strict_types=1);

namespace Falara\TranslationManager\ScheduledTask;

use Falara\TranslationManager\Service\JobPollingService;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTaskHandler;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler(handles: FalaraPollTask::class)]
class FalaraPollTaskHandler extends ScheduledTaskHandler
{
    public function __construct(
        EntityRepository $scheduledTaskRepository,
        private readonly LoggerInterface $logger,
        private readonly JobPollingService $jobPollingService,
    ) {
        parent::__construct($scheduledTaskRepository, $logger);
    }

    public function run(): void
    {
        $context = Context::createDefaultContext();
        $this->jobPollingService->pollActiveJobs($context);
        $this->jobPollingService->recoverZombieJobs();
    }
}
