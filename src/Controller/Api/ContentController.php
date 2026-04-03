<?php declare(strict_types=1);

namespace Falara\TranslationManager\Controller\Api;

use Falara\TranslationManager\Core\ContentType\ContentTypeRegistry;
use Shopware\Core\Framework\Context;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
class ContentController extends AbstractController
{
    public function __construct(
        private readonly ContentTypeRegistry $registry,
    ) {}

    #[Route(
        path: '/api/_action/falara/content/{salesChannelId}/{type}',
        name: 'api.action.falara.content.items',
        methods: ['GET'],
    )]
    public function getAvailableItems(
        string $salesChannelId,
        string $type,
        Request $request,
        Context $context,
    ): JsonResponse {
        $contentType = $this->registry->get($type);

        if ($contentType === null) {
            return new JsonResponse(['error' => sprintf('Unknown content type "%s".', $type)], 404);
        }

        $languageId = $request->query->get('languageId', $context->getLanguageId());
        $limit      = max(1, (int) $request->query->get('limit', 50));
        $offset     = max(0, (int) $request->query->get('offset', 0));

        $items = $contentType->getAvailableItems($languageId, $context, $limit, $offset);
        $total = $contentType->getTotalCount($languageId, $context);

        return new JsonResponse([
            'type'  => $type,
            'items' => $items,
            'total' => $total,
        ]);
    }

    #[Route(
        path: '/api/_action/falara/content-types',
        name: 'api.action.falara.content.types',
        methods: ['GET'],
    )]
    public function getContentTypes(): JsonResponse
    {
        $metadata = [];

        foreach ($this->registry->all() as $type => $contentType) {
            $metadata[] = [
                'type'               => $type,
                'label'              => $contentType->getLabel(),
                'translatableFields' => $contentType->getTranslatableFields(),
            ];
        }

        return new JsonResponse(['contentTypes' => $metadata]);
    }
}
