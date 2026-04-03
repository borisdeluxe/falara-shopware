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
        if (empty($data['id'])) {
            throw new \InvalidArgumentException('FalaraAccount: $data[\'id\'] must not be empty.');
        }

        return new self(
            id: $data['id'],
            name: $data['name'] ?? '',
            plan: $data['plan'] ?? '',
            role: $data['role'] ?? '',
        );
    }
}
