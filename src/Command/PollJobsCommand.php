<?php declare(strict_types=1);

namespace Falara\TranslationManager\Command;

use Doctrine\DBAL\Connection;
use Falara\TranslationManager\MessageQueue\FalaraWriteBackMessage;
use Falara\TranslationManager\Service\ConnectionService;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsAnyFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Messenger\MessageBusInterface;

#[AsCommand(name: 'falara:poll-jobs')]
class PollJobsCommand extends Command
{
    public function __construct(
        private readonly EntityRepository $jobRepository,
        private readonly ConnectionService $connectionService,
        private readonly MessageBusInterface $messageBus,
        private readonly Connection $connection,
        private readonly LoggerInterface $logger,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption(
            'sales-channel',
            null,
            InputOption::VALUE_OPTIONAL,
            'Filter by sales channel ID',
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $salesChannelFilter = $input->getOption('sales-channel');

        $io->title('Falara: Poll Active Jobs');

        $context  = Context::createDefaultContext();
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsAnyFilter('status', ['pending', 'processing', 'queued']));

        if ($salesChannelFilter !== null) {
            $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelFilter));
        }

        $jobs = $this->jobRepository->search($criteria, $context);

        $total      = $jobs->getTotal();
        $updated    = 0;
        $dispatched = 0;
        $failed     = 0;
        $skipped    = 0;

        $io->info(sprintf('Found %d active job(s) to poll.', $total));

        foreach ($jobs as $job) {
            $salesChannelId = $job->getSalesChannelId();
            $falaraJobId    = $job->getFalaraJobId();
            $localId        = $job->getId();

            try {
                $apiClient = $this->connectionService->getApiClient($salesChannelId, $context);
                $status    = $apiClient->getJobStatus($falaraJobId);
            } catch (\Throwable $e) {
                $this->logger->warning('falara:poll-jobs: could not poll job', [
                    'local_id'    => $localId,
                    'falara_id'   => $falaraJobId,
                    'error'       => $e->getMessage(),
                ]);
                ++$skipped;
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
                ++$updated;

                if ($newStatus === 'completed') {
                    $this->messageBus->dispatch(new FalaraWriteBackMessage($localId, $salesChannelId));
                    ++$dispatched;
                }
            } catch (\Throwable $e) {
                $this->logger->error('falara:poll-jobs: failed to update job', [
                    'local_id' => $localId,
                    'error'    => $e->getMessage(),
                ]);
                ++$failed;
            }
        }

        // Zombie recovery: jobs stuck in writing_back for > 15 minutes
        $zombies = $this->recoverZombies();

        $io->success(sprintf(
            'Done. Polled: %d | Updated: %d | Dispatched: %d | Skipped: %d | Errors: %d | Zombies recovered: %d',
            $total,
            $updated,
            $dispatched,
            $skipped,
            $failed,
            $zombies,
        ));

        return Command::SUCCESS;
    }

    private function recoverZombies(): int
    {
        try {
            $affected = $this->connection->executeStatement(
                "UPDATE falara_job
                 SET status = 'writeback_failed', updated_at = NOW(3)
                 WHERE status = 'writing_back'
                   AND updated_at < DATE_SUB(NOW(3), INTERVAL 15 MINUTE)",
            );
            if ($affected > 0) {
                $this->logger->warning('falara:poll-jobs: zombie recovery updated jobs', ['count' => $affected]);
            }
            return (int) $affected;
        } catch (\Throwable $e) {
            $this->logger->error('falara:poll-jobs: zombie recovery failed', ['error' => $e->getMessage()]);
            return 0;
        }
    }
}
