<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\Content\TranslationDefault;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @extends EntityCollection<FalaraTranslationDefaultEntity>
 */
class FalaraTranslationDefaultCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return FalaraTranslationDefaultEntity::class;
    }
}
