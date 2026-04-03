<?php declare(strict_types=1);

namespace Falara\TranslationManager\Tests\PHPUnit\Unit\Service;

use Falara\TranslationManager\Service\EncryptionService;
use PHPUnit\Framework\TestCase;

class EncryptionServiceTest extends TestCase
{
    private EncryptionService $service;

    protected function setUp(): void
    {
        $this->service = new EncryptionService(bin2hex(random_bytes(32)));
    }

    public function testEncryptAndDecryptRoundTrip(): void
    {
        $plaintext = 'fal_testkey123456789';
        $encrypted = $this->service->encrypt($plaintext);
        $decrypted = $this->service->decrypt($encrypted);

        static::assertSame($plaintext, $decrypted);
        static::assertNotSame($plaintext, $encrypted);
    }

    public function testEncryptProducesDifferentCiphertextEachTime(): void
    {
        $plaintext = 'fal_testkey123456789';
        $a = $this->service->encrypt($plaintext);
        $b = $this->service->encrypt($plaintext);

        static::assertNotSame($a, $b);
    }

    public function testDecryptFailsOnTamperedData(): void
    {
        $encrypted = $this->service->encrypt('secret');
        $tampered = $encrypted . 'x';

        $this->expectException(\RuntimeException::class);
        $this->service->decrypt($tampered);
    }

    public function testDecryptFailsWithWrongKey(): void
    {
        $encrypted = $this->service->encrypt('secret');
        $otherService = new EncryptionService(bin2hex(random_bytes(32)));

        $this->expectException(\RuntimeException::class);
        $otherService->decrypt($encrypted);
    }

    public function testDecryptFailsOnTooShortData(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->service->decrypt(base64_encode('short'));
    }
}
