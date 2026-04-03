<?php declare(strict_types=1);

namespace Falara\TranslationManager\Exception;

class FalaraApiException extends \RuntimeException
{
    public function __construct(
        string $message,
        private readonly int $statusCode = 0,
        private readonly ?string $detail = null,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getDetail(): ?string
    {
        return $this->detail;
    }

    public static function fromResponse(int $statusCode, string $body): self
    {
        $data = json_decode($body, true);
        if (!is_array($data)) {
            $data = [];
        }

        $detail = isset($data['detail']) ? (string) $data['detail'] : ($body !== '' ? $body : null);

        return new self(
            message: sprintf('Falara API error (HTTP %d)', $statusCode),
            statusCode: $statusCode,
            detail: $detail,
        );
    }
}
