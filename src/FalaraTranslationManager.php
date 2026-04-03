<?php declare(strict_types=1);

namespace Falara\TranslationManager;

use Doctrine\DBAL\Connection;
use Falara\TranslationManager\DependencyInjection\ContentTypeCompilerPass;
use Shopware\Core\Framework\Plugin;
use Shopware\Core\Framework\Plugin\Context\InstallContext;
use Shopware\Core\Framework\Plugin\Context\UninstallContext;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class FalaraTranslationManager extends Plugin
{
    public function build(ContainerBuilder $container): void
    {
        parent::build($container);
        $container->addCompilerPass(new ContentTypeCompilerPass());
    }

    public function install(InstallContext $installContext): void
    {
        parent::install($installContext);
    }

    public function uninstall(UninstallContext $uninstallContext): void
    {
        parent::uninstall($uninstallContext);

        if ($uninstallContext->keepUserData()) {
            return;
        }

        /** @var Connection $connection */
        $connection = $this->container->get(Connection::class);
        $connection->executeStatement('DROP TABLE IF EXISTS `falara_custom_field_whitelist`');
        $connection->executeStatement('DROP TABLE IF EXISTS `falara_translation_default`');
        $connection->executeStatement('DROP TABLE IF EXISTS `falara_job`');
        $connection->executeStatement('DROP TABLE IF EXISTS `falara_connection`');
    }
}
