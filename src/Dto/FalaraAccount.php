<?php declare(strict_types=1);

namespace Falara\TranslationManager\Dto;

class FalaraAccount
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $plan,
        public readonly string $role,
    ) {}

    public static function fromArray(array $data): self
    {
        $id = $data['account_id'] ?? $data['id'] ?? null;
        if (empty($id)) {
            throw new \InvalidArgumentException('Falara API response missing required account_id field.');
        }

        return new self(
            id: $id,
            name: $data['account_name'] ?? $data['name'] ?? '',
            plan: $data['plan'] ?? 'unknown',
            role: $data['role'] ?? 'unknown',
        );
    }
}
