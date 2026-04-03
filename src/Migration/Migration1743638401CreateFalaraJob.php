<?php declare(strict_types=1);

namespace Falara\TranslationManager\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1743638401CreateFalaraJob extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1743638401;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement('
            CREATE TABLE IF NOT EXISTS `falara_job` (
                `id` BINARY(16) NOT NULL,
                `sales_channel_id` BINARY(16) NOT NULL,
                `falara_job_id` VARCHAR(255) NOT NULL,
                `batch_id` VARCHAR(255),
                `status` VARCHAR(50) NOT NULL DEFAULT "pending",
                `resource_type` VARCHAR(50) NOT NULL,
                `resource_count` INT DEFAULT 0,
                `target_locale` VARCHAR(10) NOT NULL,
                `word_count` INT DEFAULT 0,
                `project_name` VARCHAR(500),
                `archived` TINYINT(1) DEFAULT 0,
                `export_warnings` JSON,
                `writeback_errors` JSON,
                `created_at` DATETIME(3) NOT NULL,
                `completed_at` DATETIME(3),
                `updated_at` DATETIME(3),
                PRIMARY KEY (`id`),
                UNIQUE KEY `unique_falara_job_id` (`falara_job_id`),
                KEY `idx_sales_channel_id` (`sales_channel_id`),
                KEY `idx_status` (`status`),
                CONSTRAINT `fk_falara_job_sales_channel` 
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
