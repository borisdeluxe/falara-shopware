<?php declare(strict_types=1);

namespace Falara\TranslationManager\Service;

class EncryptionService
{
    private const CIPHER = 'aes-256-gcm';
    private const NONCE_LENGTH = 12;
    private const TAG_LENGTH = 16;

    private readonly string $key;

    public function __construct(string $hexKey)
    {
        $this->key = hex2bin($hexKey);
        if ($this->key === false || strlen($this->key) !== 32) {
            throw new \InvalidArgumentException('Encryption key must be 64 hex characters (32 bytes).');
        }
    }

    public function encrypt(string $plaintext): string
    {
        $nonce = random_bytes(self::NONCE_LENGTH);
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            self::CIPHER,
            $this->key,
            OPENSSL_RAW_DATA,
            $nonce,
            $tag,
            '',
            self::TAG_LENGTH,
        );

        if ($ciphertext === false) {
            throw new \RuntimeException('Encryption failed.');
        }

        return base64_encode($nonce . $tag . $ciphertext);
    }

    public function decrypt(string $encoded): string
    {
        $raw = base64_decode($encoded, true);
        if ($raw === false) {
            throw new \RuntimeException('Decryption failed: invalid base64.');
        }

        $minLength = self::NONCE_LENGTH + self::TAG_LENGTH + 1;
        if (strlen($raw) < $minLength) {
            throw new \RuntimeException('Decryption failed: data too short.');
        }

        $nonce = substr($raw, 0, self::NONCE_LENGTH);
        $tag = substr($raw, self::NONCE_LENGTH, self::TAG_LENGTH);
        $ciphertext = substr($raw, self::NONCE_LENGTH + self::TAG_LENGTH);

        $plaintext = openssl_decrypt(
            $ciphertext,
            self::CIPHER,
            $this->key,
            OPENSSL_RAW_DATA,
            $nonce,
            $tag,
        );

        if ($plaintext === false) {
            throw new \RuntimeException('Decryption failed: authentication tag mismatch or corrupted data.');
        }

        return $plaintext;
    }
}
