<?php declare(strict_types=1);

namespace Falara\TranslationManager\Service;

use Falara\TranslationManager\Dto\FalaraAccount;
use Falara\TranslationManager\Dto\FalaraBatchResponse;
use Falara\TranslationManager\Dto\FalaraJobResult;
use Falara\TranslationManager\Dto\FalaraJobStatus;
use Falara\TranslationManager\Dto\FalaraUsage;
use Falara\TranslationManager\Exception\FalaraApiException;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;

class FalaraApiClient
{
    public const MAX_TEXTS_PER_REQUEST = 500;

    public function __construct(
        private readonly ClientInterface $httpClient,
        private readonly string $apiKey,
    ) {}

    public function getAccount(): FalaraAccount
    {
        $data = $this->get('/v1/account');

        return FalaraAccount::fromArray($data);
    }

    public function getUsage(): FalaraUsage
    {
        $data = $this->get('/v1/account/usage');

        return FalaraUsage::fromArray($data);
    }

    public function getGlossaries(): array
    {
        return $this->get('/v1/glossaries');
    }

    public function createTranslationJob(
        array $texts,
        string $sourceLang,
        array $targetLangs,
        array $options = [],
    ): FalaraBatchResponse {
        if (empty($texts)) {
            throw new \InvalidArgumentException('texts must not be empty.');
        }

        if (count($texts) > self::MAX_TEXTS_PER_REQUEST) {
            return $this->createBatchedJobs($texts, $sourceLang, $targetLangs, $options);
        }

        $targetLang = count($targetLangs) === 1 ? $targetLangs[0] : $targetLangs;

        $body = array_filter([
            'mode'           => 'translation',
            'source_lang'    => $sourceLang,
            'target_lang'    => $targetLang,
            'texts'          => $texts,
            'quality'        => $options['quality'] ?? null,
            'glossary_ids'   => $options['glossary_ids'] ?? null,
            'domain'         => $options['domain'] ?? null,
            'tone'           => $options['tone'] ?? null,
            'instructions'   => $options['instructions'] ?? null,
        ], static fn ($v) => $v !== null);

        $data = $this->post('/v1/jobs', $body);

        return FalaraBatchResponse::fromArray($data);
    }

    public function getJobStatus(string $jobId): FalaraJobStatus
    {
        $data = $this->get('/v1/jobs/' . $jobId);

        return FalaraJobStatus::fromArray($data);
    }

    public function getJobResult(string $jobId): FalaraJobResult
    {
        $data = $this->get('/v1/jobs/' . $jobId . '/result');

        return FalaraJobResult::fromArray($data);
    }

    public function registerWebhook(string $url, string $secret): void
    {
        $this->put('/v1/webhooks/config', [
            'url'    => $url,
            'secret' => $secret,
        ]);
    }

    public function getWebhookConfig(): ?array
    {
        try {
            return $this->get('/v1/webhooks/config');
        } catch (FalaraApiException $e) {
            if ($e->getStatusCode() === 404) {
                return null;
            }

            throw $e;
        }
    }

    public function deleteWebhook(): void
    {
        $this->delete('/v1/webhooks/config');
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function createBatchedJobs(
        array $texts,
        string $sourceLang,
        array $targetLangs,
        array $options,
    ): FalaraBatchResponse {
        $chunks = array_chunk($texts, self::MAX_TEXTS_PER_REQUEST);
        $batchId = 'local-batch-' . bin2hex(random_bytes(8));
        $allJobs = [];

        foreach ($chunks as $chunk) {
            $response = $this->createTranslationJob($chunk, $sourceLang, $targetLangs, $options);
            foreach ($response->jobs as $job) {
                $allJobs[] = $job;
            }
        }

        return new FalaraBatchResponse(batchId: $batchId, jobs: $allJobs);
    }

    private function get(string $path): array
    {
        return $this->request('GET', $path, null);
    }

    private function post(string $path, array $body): array
    {
        return $this->request('POST', $path, $body);
    }

    private function put(string $path, array $body): array
    {
        return $this->request('PUT', $path, $body);
    }

    private function delete(string $path): array
    {
        return $this->request('DELETE', $path, null);
    }

    private function request(string $method, string $path, ?array $body): array
    {
        $options = [
            'headers' => [
                'X-API-Key' => $this->apiKey,
                'Accept'    => 'application/json',
            ],
        ];

        if ($body !== null) {
            $options['json'] = $body;
        }

        try {
            $response = $this->httpClient->request($method, $path, $options);
        } catch (GuzzleException $e) {
            $innerResponse = method_exists($e, 'getResponse') ? $e->getResponse() : null;
            if ($innerResponse !== null) {
                $statusCode = $innerResponse->getStatusCode();
                $responseBody = (string) $innerResponse->getBody();
                throw FalaraApiException::fromResponse($statusCode, $responseBody);
            }

            throw new FalaraApiException(
                message: 'Falara API request failed: ' . $e->getMessage(),
                statusCode: 0,
                previous: $e,
            );
        }

        $statusCode = $response->getStatusCode();

        if ($statusCode >= 400) {
            $responseBody = (string) $response->getBody();
            throw FalaraApiException::fromResponse($statusCode, $responseBody);
        }

        if ($statusCode === 204) {
            return [];
        }

        $responseBody = (string) $response->getBody();

        if ($responseBody === '') {
            return [];
        }

        $decoded = json_decode($responseBody, true);

        if (!is_array($decoded)) {
            return [];
        }

        return $decoded;
    }
}
