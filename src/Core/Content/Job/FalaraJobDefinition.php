<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\Content\Job;

use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\BoolField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IntField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\JsonField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use Shopware\Core\System\SalesChannel\SalesChannelDefinition;

class FalaraJobDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'falara_job';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    public function getEntityClass(): string
    {
        return FalaraJobEntity::class;
    }

    public function getCollectionClass(): string
    {
        return FalaraJobCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            new FkField('sales_channel_id', 'salesChannelId', SalesChannelDefinition::class),
            (new StringField('falara_job_id', 'falaraJobId'))->addFlags(new Required()),
            new StringField('batch_id', 'batchId'),
            (new StringField('status', 'status'))->addFlags(new Required()),
            (new StringField('resource_type', 'resourceType'))->addFlags(new Required()),
            new IntField('resource_count', 'resourceCount'),
            (new StringField('target_locale', 'targetLocale'))->addFlags(new Required()),
            new IntField('word_count', 'wordCount'),
            new StringField('project_name', 'projectName'),
            new BoolField('archived', 'archived'),
            new JsonField('export_warnings', 'exportWarnings'),
            new JsonField('writeback_errors', 'writebackErrors'),
            new DateTimeField('completed_at', 'completedAt'),
            new ManyToOneAssociationField('salesChannel', 'sales_channel_id', SalesChannelDefinition::class, 'id', false),
        ]);
    }
}
