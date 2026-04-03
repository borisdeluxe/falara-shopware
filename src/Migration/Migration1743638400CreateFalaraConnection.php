<?php declare(strict_types=1);

namespace Falara\TranslationManager\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1743638400CreateFalaraConnection extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1743638400;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement('
            CREATE TABLE IF NOT EXISTS `falara_connection` (
                `id` BINARY(16) NOT NULL,
                `sales_channel_id` BINARY(16) NOT NULL,
                `falara_api_key` LONGTEXT NOT NULL,
                `falara_account_id` VARCHAR(255) NOT NULL,
                `webhook_secret` LONGTEXT NOT NULL,
                `disconnected_at` DATETIME(3),
                `created_at` DATETIME(3) NOT NULL,
                `updated_at` DATETIME(3),
                PRIMARY KEY (`id`),
                UNIQUE KEY `unique_sales_channel` (`sales_channel_id`),
                CONSTRAINT `fk_falara_connection_sales_channel` 
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
