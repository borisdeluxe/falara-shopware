<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\ContentType;

class ContentTypeRegistry
{
    /** @var array<string, ContentTypeInterface> */
    private array $types = [];

    public function register(ContentTypeInterface $type): void
    {
        $this->types[$type->getType()] = $type;
    }

    public function get(string $type): ?ContentTypeInterface
    {
        return $this->types[$type] ?? null;
    }

    /** @return array<string, ContentTypeInterface> */
    public function all(): array
    {
        return $this->types;
    }

    public function has(string $type): bool
    {
        return isset($this->types[$type]);
    }
}
