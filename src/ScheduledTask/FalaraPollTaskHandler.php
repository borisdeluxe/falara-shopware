<?php declare(strict_types=1);

namespace Falara\TranslationManager\ScheduledTask;

use Doctrine\DBAL\Connection;
use Falara\TranslationManager\MessageQueue\FalaraWriteBackMessage;
use Falara\TranslationManager\Service\ConnectionService;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsAnyFilter;
use Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTaskHandler;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\MessageBusInterface;

#[AsMessageHandler(handles: FalaraPollTask::class)]
class FalaraPollTaskHandler extends ScheduledTaskHandler
{
    public function __construct(
        EntityRepository $scheduledTaskRepository,
        private readonly LoggerInterface $logger,
        private readonly EntityRepository $jobRepository,
        private readonly ConnectionService $connectionService,
        private readonly MessageBusInterface $messageBus,
        private readonly Connection $connection,
    ) {
        parent::__construct($scheduledTaskRepository, $logger);
    }

    public function run(): void
    {
        $context  = Context::createDefaultContext();
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsAnyFilter('status', ['pending', 'processing', 'queued']));

        $jobs = $this->jobRepository->search($criteria, $context);

        foreach ($jobs as $job) {
            $salesChannelId = $job->getSalesChannelId();
            $falaraJobId    = $job->getFalaraJobId();
            $localId        = $job->getId();

            try {
                $apiClient = $this->connectionService->getApiClient($salesChannelId, $context);
                $status    = $apiClient->getJobStatus($falaraJobId);
            } catch (\Throwable $e) {
                $this->logger->warning('FalaraPollTaskHandler: could not poll job', [
                    'local_id'  => $localId,
                    'falara_id' => $falaraJobId,
                    'error'     => $e->getMessage(),
                ]);
                continue;
            }

            if (!$status->isTerminal()) {
                continue;
            }

            $newStatus = match (true) {
                in_array($status->status, ['completed', 'completed_with_blocks', 'needs_review'], true) => 'completed',
                default                                                                                   => 'failed',
            };

            try {
                $this->jobRepository->update([[
                    'id'     => $localId,
                    'status' => $newStatus,
                ]], $context);

                if ($newStatus === 'completed') {
                    $this->messageBus->dispatch(new FalaraWriteBackMessage($localId, $salesChannelId));
                }
            } catch (\Throwable $e) {
                $this->logger->error('FalaraPollTaskHandler: failed to update job', [
                    'local_id' => $localId,
                    'error'    => $e->getMessage(),
                ]);
            }
        }

        $this->recoverZombies();
    }

    private function recoverZombies(): void
    {
        try {
            $affected = $this->connection->executeStatement(
                "UPDATE falara_job
                 SET status = 'writeback_failed', updated_at = NOW(3)
                 WHERE status = 'writing_back'
                   AND updated_at < DATE_SUB(NOW(3), INTERVAL 15 MINUTE)",
            );
            if ($affected > 0) {
                $this->logger->warning('FalaraPollTaskHandler: zombie recovery', ['count' => $affected]);
            }
        } catch (\Throwable $e) {
            $this->logger->error('FalaraPollTaskHandler: zombie recovery failed', ['error' => $e->getMessage()]);
        }
    }
}
