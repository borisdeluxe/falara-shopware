<?php declare(strict_types=1);

namespace Falara\TranslationManager\Command;

use Falara\TranslationManager\Service\JobPollingService;
use Shopware\Core\Framework\Context;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'falara:poll-jobs')]
class PollJobsCommand extends Command
{
    public function __construct(
        private readonly JobPollingService $jobPollingService,
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

        $context = Context::createDefaultContext();
        $stats   = $this->jobPollingService->pollActiveJobs($context, $salesChannelFilter);
        $zombies = $this->jobPollingService->recoverZombieJobs();

        $io->info(sprintf('Found %d active job(s) to poll.', $stats['polled']));

        $io->success(sprintf(
            'Done. Polled: %d | Updated: %d | Dispatched: %d | Skipped: %d | Errors: %d | Zombies recovered: %d',
            $stats['polled'],
            $stats['updated'],
            $stats['dispatched'],
            $stats['skipped'],
            $stats['failed'],
            $zombies,
        ));

        return Command::SUCCESS;
    }
}
