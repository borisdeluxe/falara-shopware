<?php declare(strict_types=1);

namespace Falara\TranslationManager\Tests\PHPUnit\Unit\Controller;

use Falara\TranslationManager\Controller\Webhook\WebhookController;
use PHPUnit\Framework\TestCase;

class WebhookControllerTest extends TestCase
{
    public function testValidateSignatureUsesHashEquals(): void
    {
        $secret  = 'my-webhook-secret';
        $payload = '{"event":"job.completed","data":{"job_id":"abc123"}}';
        $hmac    = 'sha256=' . hash_hmac('sha256', $payload, $secret);

        static::assertTrue(WebhookController::validateSignature($payload, $hmac, $secret));
    }

    public function testValidateSignatureRejectsInvalid(): void
    {
        $secret        = 'my-webhook-secret';
        $payload       = '{"event":"job.completed","data":{"job_id":"abc123"}}';
        $wrongSignature = 'sha256=deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

        static::assertFalse(WebhookController::validateSignature($payload, $wrongSignature, $secret));
    }

    public function testValidateTimestampAcceptsRecent(): void
    {
        $timestamp = (string) time();

        static::assertTrue(WebhookController::validateTimestamp($timestamp));
    }

    public function testValidateTimestampRejectsOld(): void
    {
        $oldTimestamp = (string) (time() - 400);

        static::assertFalse(WebhookController::validateTimestamp($oldTimestamp));
    }
}
