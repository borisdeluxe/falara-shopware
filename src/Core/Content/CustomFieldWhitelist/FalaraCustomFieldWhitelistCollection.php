<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\Content\CustomFieldWhitelist;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @extends EntityCollection<FalaraCustomFieldWhitelistEntity>
 */
class FalaraCustomFieldWhitelistCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return FalaraCustomFieldWhitelistEntity::class;
    }
}
