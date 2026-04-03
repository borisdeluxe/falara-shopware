<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\Content\Job;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @extends EntityCollection<FalaraJobEntity>
 */
class FalaraJobCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return FalaraJobEntity::class;
    }
}
