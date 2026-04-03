<?php declare(strict_types=1);

namespace Falara\TranslationManager\Service;

use Falara\TranslationManager\Exception\FalaraApiException;
use GuzzleHttp\Client;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsAnyFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\Uuid\Uuid;

class ConnectionService
{
    public function __construct(
        private readonly EntityRepository $connectionRepository,
        private readonly EntityRepository $jobRepository,
        private readonly EncryptionService $encryption,
        private readonly string $falaraApiUrl,

    ) {}

    public function connect(string $apiKey, string $salesChannelId, string $webhookUrl, Context $context): array
    {
        $client = $this->createApiClient($apiKey);
        $account = $client->getAccount();

        $webhookSecret = bin2hex(random_bytes(16));

        try {
            $client->registerWebhook($webhookUrl, $webhookSecret);
        } catch (FalaraApiException $e) {
            throw new FalaraApiException(
                'API key is valid, but webhook registration failed. Please try again.',
                $e->getStatusCode(), $e->getDetail(), $e,
            );
        }

        try {
            $this->connectionRepository->upsert([[
                'id' => Uuid::randomHex(),
                'salesChannelId' => $salesChannelId,
                'falaraApiKey' => $this->encryption->encrypt($apiKey),
                'falaraAccountId' => $account->id,
                'webhookSecret' => $this->encryption->encrypt($webhookSecret),
                'disconnectedAt' => null,
            ]], $context);
        } catch (\Throwable $e) {
            try { $client->deleteWebhook(); } catch (\Throwable) {}
            throw new \RuntimeException('Connection could not be saved. Please try again.', 0, $e);
        }

        return ['accountId' => $account->id, 'plan' => $account->plan];
    }

    public function disconnect(string $salesChannelId, Context $context): void
    {
        $connection = $this->findConnection($salesChannelId, $context);
        if ($connection === null) { return; }

        $this->connectionRepository->update([[
            'id' => $connection['id'],
            'disconnectedAt' => (new \DateTimeImmutable())->format('Y-m-d H:i:s.v'),
        ]], $context);

        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));
        $criteria->addFilter(new EqualsAnyFilter('status', ['pending', 'processing', 'queued']));
        $jobs = $this->jobRepository->searchIds($criteria, $context);
        if ($jobs->getTotal() > 0) {
            $updates = [];
            foreach ($jobs->getIds() as $id) {
                $updates[] = ['id' => $id, 'status' => 'failed', 'writebackErrors' => [['code' => 'CONNECTION_DISCONNECTED', 'message' => 'Connection disconnected']]];
            }
            $this->jobRepository->update($updates, $context);
        }

        try {
            $apiKey = $this->encryption->decrypt($connection['falaraApiKey']);
            $this->createApiClient($apiKey)->deleteWebhook();
        } catch (\Throwable) {}
    }

    /** Returns SAFE fields only — never exposes encrypted secrets */
    public function getConnection(string $salesChannelId, Context $context): ?array
    {
        $connection = $this->findConnection($salesChannelId, $context);
        if ($connection === null) { return null; }
        return [
            'id' => $connection['id'],
            'salesChannelId' => $connection['salesChannelId'],
            'falaraAccountId' => $connection['falaraAccountId'],
            'disconnectedAt' => $connection['disconnectedAt'],
        ];
    }

    public function getApiClient(string $salesChannelId, Context $context): FalaraApiClient
    {
        $connection = $this->findConnection($salesChannelId, $context);
        if ($connection === null || $connection['disconnectedAt'] !== null) {
            throw new \RuntimeException('No active Falara connection for this sales channel.');
        }
        $apiKey = $this->encryption->decrypt($connection['falaraApiKey']);
        return $this->createApiClient($apiKey);
    }

    public function getWebhookSecret(string $salesChannelId, Context $context): string
    {
        $connection = $this->findConnection($salesChannelId, $context);
        if ($connection === null) {
            throw new \RuntimeException('No Falara connection found.');
        }
        return $this->encryption->decrypt($connection['webhookSecret']);
    }

    public function hasInFlightJobs(string $salesChannelId, Context $context): int
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));
        $criteria->addFilter(new EqualsAnyFilter('status', ['pending', 'processing', 'queued']));
        return $this->jobRepository->searchIds($criteria, $context)->getTotal();
    }

    private function findConnection(string $salesChannelId, Context $context): ?array
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));
        $criteria->setLimit(1);
        $entity = $this->connectionRepository->search($criteria, $context)->first();
        if ($entity === null) { return null; }
        return [
            'id' => $entity->getId(),
            'salesChannelId' => $entity->getSalesChannelId(),
            'falaraApiKey' => $entity->getFalaraApiKey(),
            'falaraAccountId' => $entity->getFalaraAccountId(),
            'webhookSecret' => $entity->getWebhookSecret(),
            'disconnectedAt' => $entity->getDisconnectedAt(),
        ];
    }

    private function createApiClient(string $apiKey): FalaraApiClient
    {
        $httpClient = new Client(['base_uri' => $this->falaraApiUrl]);
        return new FalaraApiClient($httpClient, $apiKey);
    }
}
