<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\Content\Connection;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @extends EntityCollection<FalaraConnectionEntity>
 */
class FalaraConnectionCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return FalaraConnectionEntity::class;
    }
}
