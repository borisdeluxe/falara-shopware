<?php declare(strict_types=1);

namespace Falara\TranslationManager\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1743638403CreateFalaraCustomFieldWhitelist extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1743638403;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement('
            CREATE TABLE IF NOT EXISTS `falara_custom_field_whitelist` (
                `id` BINARY(16) NOT NULL,
                `sales_channel_id` BINARY(16) NOT NULL,
                `field_set_name` VARCHAR(255) NOT NULL,
                `field_name` VARCHAR(255) NOT NULL,
                `created_at` DATETIME(3) NOT NULL,
                `updated_at` DATETIME(3),
                PRIMARY KEY (`id`),
                UNIQUE KEY `unique_sales_channel_field` (`sales_channel_id`, `field_set_name`, `field_name`),
                CONSTRAINT `fk_falara_custom_field_whitelist_sales_channel` 
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
