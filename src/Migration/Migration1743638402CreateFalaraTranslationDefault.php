<?php declare(strict_types=1);

namespace Falara\TranslationManager\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1743638402CreateFalaraTranslationDefault extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1743638402;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement('
            CREATE TABLE IF NOT EXISTS `falara_translation_default` (
                `id` BINARY(16) NOT NULL,
                `sales_channel_id` BINARY(16) NOT NULL,
                `glossary_id` VARCHAR(255),
                `domain` VARCHAR(50),
                `tone` VARCHAR(50),
                `quality` VARCHAR(20) NOT NULL DEFAULT "standard",
                `instructions` LONGTEXT,
                `created_at` DATETIME(3) NOT NULL,
                `updated_at` DATETIME(3),
                PRIMARY KEY (`id`),
                UNIQUE KEY `unique_sales_channel` (`sales_channel_id`),
                CONSTRAINT `fk_falara_translation_default_sales_channel` 
                    FOREIGN KEY (`sales_channel_id`) 
                    REFERENCES `sales_channel` (`id`) 
                    ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ');
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
