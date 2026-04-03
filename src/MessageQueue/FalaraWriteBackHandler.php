<?php declare(strict_types=1);

namespace Falara\TranslationManager\MessageQueue;

use Falara\TranslationManager\Service\ConnectionService;
use Falara\TranslationManager\Service\TranslationWriter;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class FalaraWriteBackHandler
{
    public function __construct(
        private readonly TranslationWriter $writer,
        private readonly ConnectionService $connectionService,
        private readonly EntityRepository $jobRepository,
        private readonly LoggerInterface $logger,
    ) {}

    public function __invoke(FalaraWriteBackMessage $message): void
    {
        $jobId         = $message->getJobId();
        $salesChannelId = $message->getSalesChannelId();
        $context       = Context::createDefaultContext();

        // 1. Load job
        $criteria = new Criteria([$jobId]);
        $job = $this->jobRepository->search($criteria, $context)->first();

        if ($job === null) {
            $this->logger->warning('FalaraWriteBackHandler: job not found, skipping', [
                'job_id' => $jobId,
            ]);
            return;
        }

        // 2. Claim job atomically
        if (!$this->writer->claimJob($jobId)) {
            $this->logger->info('FalaraWriteBackHandler: job already claimed, skipping', [
                'job_id' => $jobId,
            ]);
            return;
        }

        // 3. Fetch result from API, write back, finalize
        try {
            $apiClient = $this->connectionService->getApiClient($salesChannelId, $context);
            $result    = $apiClient->getJobResult($job->getFalaraJobId());

            $targetLanguageId = $job->getTargetLocale() ?? '';
            $writeBackResult  = $this->writer->writeBack($result, $targetLanguageId, $context);

            $this->writer->finalizeJob($jobId, $writeBackResult, $context);
        } catch (\Throwable $e) {
            $this->logger->error('FalaraWriteBackHandler: write-back failed', [
                'job_id' => $jobId,
                'error'  => $e->getMessage(),
            ]);

            $this->writer->failJob($jobId, $e->getMessage(), $context);

            throw $e;
        }
    }
}
