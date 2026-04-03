<?php declare(strict_types=1);

namespace Falara\TranslationManager\Tests\PHPUnit\Unit\Service;

use Falara\TranslationManager\Dto\FalaraAccount;
use Falara\TranslationManager\Dto\FalaraBatchResponse;
use Falara\TranslationManager\Dto\FalaraJobResult;
use Falara\TranslationManager\Dto\FalaraJobStatus;
use Falara\TranslationManager\Dto\FalaraUsage;
use Falara\TranslationManager\Exception\FalaraApiException;
use Falara\TranslationManager\Service\FalaraApiClient;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;

class FalaraApiClientTest extends TestCase
{
    private function createClient(array $responses): FalaraApiClient
    {
        $mock = new MockHandler($responses);
        $stack = HandlerStack::create($mock);
        $httpClient = new Client(['handler' => $stack]);

        return new FalaraApiClient($httpClient, 'test-api-key');
    }

    public function testGetAccountReturnsDto(): void
    {
        $payload = json_encode([
            'id'   => 'acc-123',
            'name' => 'Test Org',
            'plan' => 'pro',
            'role' => 'admin',
        ]);

        $client = $this->createClient([new Response(200, [], $payload)]);
        $account = $client->getAccount();

        static::assertInstanceOf(FalaraAccount::class, $account);
        static::assertSame('acc-123', $account->id);
        static::assertSame('Test Org', $account->name);
        static::assertSame('pro', $account->plan);
        static::assertSame('admin', $account->role);
    }

    public function testGetUsageReturnsDto(): void
    {
        $payload = json_encode([
            'words_used'      => 1500,
            'words_limit'     => 10000,
            'words_remaining' => 8500,
        ]);

        $client = $this->createClient([new Response(200, [], $payload)]);
        $usage = $client->getUsage();

        static::assertInstanceOf(FalaraUsage::class, $usage);
        static::assertSame(1500, $usage->wordsUsed);
        static::assertSame(10000, $usage->wordsLimit);
        static::assertSame(8500, $usage->wordsRemaining);
        static::assertFalse($usage->isExhausted());
        static::assertSame(15.0, $usage->getPercentUsed());
    }

    public function testCreateTranslationJobThrowsOnEmptyTexts(): void
    {
        $client = $this->createClient([]);

        $this->expectException(\InvalidArgumentException::class);
        $client->createTranslationJob([], 'en', ['de']);
    }

    public function testCreateTranslationJobReturnsResponse(): void
    {
        $payload = json_encode([
            'job_id' => 'job-abc',
        ]);

        $client = $this->createClient([new Response(202, [], $payload)]);
        $response = $client->createTranslationJob(
            ['Hello world'],
            'en',
            ['de'],
        );

        static::assertInstanceOf(FalaraBatchResponse::class, $response);
        static::assertNull($response->batchId);
        static::assertCount(1, $response->jobs);
        static::assertSame('job-abc', $response->jobs[0]['job_id']);
    }

    public function testCreateTranslationJobWithMultipleTargetLangs(): void
    {
        $payload = json_encode([
            'batch_id' => 'batch-xyz',
            'jobs'     => [
                ['job_id' => 'job-1'],
                ['job_id' => 'job-2'],
            ],
        ]);

        $client = $this->createClient([new Response(202, [], $payload)]);
        $response = $client->createTranslationJob(
            ['Hello world', 'Goodbye'],
            'en',
            ['de', 'fr'],
        );

        static::assertInstanceOf(FalaraBatchResponse::class, $response);
        static::assertSame('batch-xyz', $response->batchId);
        static::assertCount(2, $response->jobs);
    }

    public function testGetJobStatusReturnsDto(): void
    {
        $payload = json_encode([
            'job_id'       => 'job-abc',
            'status'       => 'completed',
            'current_step' => null,
            'qa_score'     => 98.5,
        ]);

        $client = $this->createClient([new Response(200, [], $payload)]);
        $status = $client->getJobStatus('job-abc');

        static::assertInstanceOf(FalaraJobStatus::class, $status);
        static::assertSame('job-abc', $status->jobId);
        static::assertSame('completed', $status->status);
        static::assertSame(98.5, $status->qaScore);
        static::assertTrue($status->isTerminal());
    }

    public function testGetJobStatusNonTerminal(): void
    {
        $payload = json_encode([
            'job_id'       => 'job-xyz',
            'status'       => 'processing',
            'current_step' => 'translation',
            'qa_score'     => null,
        ]);

        $client = $this->createClient([new Response(200, [], $payload)]);
        $status = $client->getJobStatus('job-xyz');

        static::assertFalse($status->isTerminal());
        static::assertSame('translation', $status->currentStep);
    }

    public function testGetJobResultReturnsDto(): void
    {
        $payload = json_encode([
            'job_id'        => 'job-abc',
            'translated_text' => ['Hallo Welt', 'Auf Wiedersehen'],
            'qa_score'      => 95.0,
            'billed_words'  => 4,
        ]);

        $client = $this->createClient([new Response(200, [], $payload)]);
        $result = $client->getJobResult('job-abc');

        static::assertInstanceOf(FalaraJobResult::class, $result);
        static::assertSame('job-abc', $result->jobId);
        static::assertCount(2, $result->translations);
        static::assertSame('Hallo Welt', $result->translations[0]);
        static::assertSame(95.0, $result->qaScore);
        static::assertSame(4, $result->billedWords);
    }

    public function testApiErrorThrowsException(): void
    {
        $payload = json_encode(['detail' => 'Invalid API key.']);

        $client = $this->createClient([new Response(401, [], $payload)]);

        $this->expectException(FalaraApiException::class);

        try {
            $client->getAccount();
        } catch (FalaraApiException $e) {
            static::assertSame(401, $e->getStatusCode());
            static::assertSame('Invalid API key.', $e->getDetail());

            throw $e;
        }
    }

    public function testGetWebhookConfigReturnsNullOn404(): void
    {
        $payload = json_encode(['detail' => 'Not found.']);

        $client = $this->createClient([new Response(404, [], $payload)]);
        $config = $client->getWebhookConfig();

        static::assertNull($config);
    }

    public function testGetWebhookConfigReturnsArrayWhenFound(): void
    {
        $payload = json_encode([
            'url'    => 'https://example.com/webhook',
            'secret' => 'mysecret',
        ]);

        $client = $this->createClient([new Response(200, [], $payload)]);
        $config = $client->getWebhookConfig();

        static::assertIsArray($config);
        static::assertSame('https://example.com/webhook', $config['url']);
    }

    public function testBatchingChunksLargeTextArrays(): void
    {
        // Build 600 texts — should split into 2 requests (500 + 100)
        $texts = array_fill(0, 600, 'Hello');

        $makeJob = static fn (string $id) => json_encode(['job_id' => $id]);

        // MockHandler will serve responses in order; two calls expected
        $client = $this->createClient([
            new Response(202, [], $makeJob('job-chunk-1')),
            new Response(202, [], $makeJob('job-chunk-2')),
        ]);

        $response = $client->createTranslationJob($texts, 'en', ['de']);

        static::assertInstanceOf(FalaraBatchResponse::class, $response);
        static::assertNotNull($response->batchId);
        static::assertStringStartsWith('local-batch-', $response->batchId);
        static::assertCount(2, $response->jobs);
    }
}
