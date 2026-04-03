<?php declare(strict_types=1);

namespace Falara\TranslationManager\DependencyInjection;

use Falara\TranslationManager\Core\ContentType\ContentTypeRegistry;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class ContentTypeCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        if (!$container->has(ContentTypeRegistry::class)) {
            return;
        }

        $registry = $container->findDefinition(ContentTypeRegistry::class);
        $taggedServices = $container->findTaggedServiceIds('falara.content_type');

        foreach ($taggedServices as $id => $tags) {
            $registry->addMethodCall('register', [new Reference($id)]);
        }
    }
}
