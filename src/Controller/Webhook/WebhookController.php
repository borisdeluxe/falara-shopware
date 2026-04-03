<?php declare(strict_types=1);

namespace Falara\TranslationManager\Controller\Webhook;

use Falara\TranslationManager\MessageQueue\FalaraWriteBackMessage;
use Falara\TranslationManager\Service\ConnectionService;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
class WebhookController extends AbstractController
{
    public function __construct(
        private readonly EntityRepository $jobRepository,
        private readonly ConnectionService $connectionService,
        private readonly MessageBusInterface $messageBus,
        private readonly LoggerInterface $logger,
    ) {}

    #[Route(
        path: '/api/_action/falara/webhook',
        name: 'api.action.falara.webhook',
        methods: ['POST'],
        defaults: ['auth_required' => false],
    )]
    public function handle(Request $request): JsonResponse
    {
        $payload   = $request->getContent();
        $signature = $request->headers->get('X-Falara-Signature', '');
        $timestamp = $request->headers->get('X-Falara-Timestamp', '');

        if (!self::validateTimestamp($timestamp)) {
            $this->logger->warning('Falara webhook: timestamp rejected', ['timestamp' => $timestamp]);
            return new JsonResponse(['ok' => false, 'error' => 'timestamp_invalid'], 200);
        }

        $data = json_decode($payload, true);
        if (!is_array($data)) {
            return new JsonResponse(['ok' => false, 'error' => 'invalid_json'], 200);
        }

        $event   = $data['event'] ?? '';
        $jobId   = $data['data']['job_id'] ?? null;
        $context = Context::createDefaultContext();

        // Find local job
        $localJob = null;
        if ($jobId !== null) {
            $criteria = new Criteria();
            $criteria->addFilter(new EqualsFilter('falaraJobId', $jobId));
            $criteria->setLimit(1);
            $localJob = $this->jobRepository->search($criteria, $context)->first();
        }

        // Determine sales channel for secret lookup
        $salesChannelId = $localJob?->getSalesChannelId();

        if ($salesChannelId === null) {
            // batch.completed or unknown job — validate with any available connection not possible, log and accept
            $this->logger->info('Falara webhook: no local job found', ['event' => $event, 'job_id' => $jobId]);
            return new JsonResponse(['ok' => true]);
        }

        // Validate HMAC
        try {
            $secret = $this->connectionService->getWebhookSecret($salesChannelId, $context);
        } catch (\Throwable $e) {
            $this->logger->error('Falara webhook: could not load secret', ['error' => $e->getMessage()]);
            return new JsonResponse(['ok' => true]);
        }

        if (!self::validateSignature($payload, $signature, $secret)) {
            $this->logger->warning('Falara webhook: invalid signature', ['event' => $event]);
            return new JsonResponse(['ok' => false, 'error' => 'invalid_signature'], 200);
        }

        // Check if connection is disconnected
        $connection = $this->connectionService->getConnection($salesChannelId, $context);
        if ($connection === null || $connection['disconnectedAt'] !== null) {
            $this->logger->info('Falara webhook: connection disconnected, skipping', ['sales_channel_id' => $salesChannelId]);
            return new JsonResponse(['ok' => true]);
        }

        // Process event
        $localId = $localJob->getId();

        match ($event) {
            'job.completed', 'job.needs_review' => $this->handleJobTerminal($localId, $salesChannelId, $event, $context),
            'job.failed'                         => $this->handleJobFailed($localId, $context),
            'batch.completed'                    => $this->logger->info('Falara webhook: batch.completed received', ['data' => $data['data'] ?? []]),
            default                              => $this->logger->info('Falara webhook: unknown event', ['event' => $event]),
        };

        return new JsonResponse(['ok' => true]);
    }

    // -------------------------------------------------------------------------
    // Static helpers (also used in tests)
    // -------------------------------------------------------------------------

    public static function validateSignature(string $payload, string $signature, string $secret): bool
    {
        $expected = 'sha256=' . hash_hmac('sha256', $payload, $secret);
        return hash_equals($expected, $signature);
    }

    public static function validateTimestamp(string $timestamp): bool
    {
        if (!ctype_digit($timestamp)) {
            return false;
        }
        return abs(time() - (int) $timestamp) <= 300;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function handleJobTerminal(string $localId, string $salesChannelId, string $event, Context $context): void
    {
        $this->jobRepository->update([[
            'id'     => $localId,
            'status' => 'completed',
        ]], $context);

        $this->messageBus->dispatch(new FalaraWriteBackMessage($localId, $salesChannelId));

        $this->logger->info('Falara webhook: dispatched write-back', ['job_id' => $localId, 'event' => $event]);
    }

    private function handleJobFailed(string $localId, Context $context): void
    {
        $this->jobRepository->update([[
            'id'     => $localId,
            'status' => 'failed',
        ]], $context);

        $this->logger->info('Falara webhook: job marked failed', ['job_id' => $localId]);
    }
}
