<?php declare(strict_types=1);

namespace Falara\TranslationManager\Service;

use Doctrine\DBAL\Connection;
use Falara\TranslationManager\MessageQueue\FalaraWriteBackMessage;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsAnyFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Symfony\Component\Messenger\MessageBusInterface;

class JobPollingService
{
    public function __construct(
        private readonly EntityRepository $jobRepository,
        private readonly ConnectionService $connectionService,
        private readonly MessageBusInterface $messageBus,
        private readonly Connection $connection,
        private readonly LoggerInterface $logger,
    ) {}

    /**
     * Polls all in-flight jobs, updates terminal ones, and dispatches write-back messages.
     *
     * @return array{polled: int, updated: int, dispatched: int, skipped: int, failed: int}
     */
    public function pollActiveJobs(Context $context, ?string $salesChannelId = null): array
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsAnyFilter('status', JobStatus::IN_FLIGHT));

        if ($salesChannelId !== null) {
            $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));
        }

        $jobs = $this->jobRepository->search($criteria, $context);

        $stats = ['polled' => $jobs->getTotal(), 'updated' => 0, 'dispatched' => 0, 'skipped' => 0, 'failed' => 0];

        foreach ($jobs as $job) {
            $scId        = $job->getSalesChannelId();
            $falaraJobId = $job->getFalaraJobId();
            $localId     = $job->getId();

            try {
                $apiClient = $this->connectionService->getApiClient($scId, $context);
                $status    = $apiClient->getJobStatus($falaraJobId);
            } catch (\Throwable $e) {
                $this->logger->warning('JobPollingService: could not poll job', [
                    'local_id'  => $localId,
                    'falara_id' => $falaraJobId,
                    'error'     => $e->getMessage(),
                ]);
                ++$stats['skipped'];
                continue;
            }

            if (!$status->isTerminal()) {
                continue;
            }

            $newStatus = in_array($status->status, JobStatus::WRITEBACK_ELIGIBLE, true)
                ? JobStatus::COMPLETED
                : JobStatus::FAILED;

            try {
                $this->jobRepository->update([[
                    'id'     => $localId,
                    'status' => $newStatus,
                ]], $context);
                ++$stats['updated'];

                if ($newStatus === JobStatus::COMPLETED) {
                    $this->messageBus->dispatch(new FalaraWriteBackMessage($localId, $scId));
                    ++$stats['dispatched'];
                }
            } catch (\Throwable $e) {
                $this->logger->error('JobPollingService: failed to update job', [
                    'local_id' => $localId,
                    'error'    => $e->getMessage(),
                ]);
                ++$stats['failed'];
            }
        }

        return $stats;
    }

    /**
     * Recovers zombie jobs stuck in writing_back for > 15 minutes.
     *
     * @return int Number of recovered zombies
     */
    public function recoverZombieJobs(): int
    {
        try {
            $affected = $this->connection->executeStatement(
                "UPDATE falara_job
                 SET status = :newStatus, updated_at = NOW(3)
                 WHERE status = :writingBack
                   AND updated_at < DATE_SUB(NOW(3), INTERVAL 15 MINUTE)",
                [
                    'newStatus'   => JobStatus::WRITEBACK_FAILED,
                    'writingBack' => JobStatus::WRITING_BACK,
                ],
            );
            if ($affected > 0) {
                $this->logger->warning('JobPollingService: zombie recovery updated jobs', ['count' => $affected]);
            }
            return (int) $affected;
        } catch (\Throwable $e) {
            $this->logger->error('JobPollingService: zombie recovery failed', ['error' => $e->getMessage()]);
            return 0;
        }
    }
}
