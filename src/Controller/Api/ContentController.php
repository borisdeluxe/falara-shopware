<?php declare(strict_types=1);

namespace Falara\TranslationManager\Controller\Api;

use Falara\TranslationManager\Core\ContentType\ContentTypeRegistry;
use Falara\TranslationManager\Core\ContentType\SnippetContentType;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
class ContentController extends AbstractController
{
    public function __construct(
        private readonly ContentTypeRegistry $registry,
        private readonly EntityRepository $salesChannelRepository,
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

        // Snippet group filtering
        $group = $request->query->get('group');
        if ($type === 'snippet' && $group !== null && $group !== '' && $contentType instanceof SnippetContentType) {
            $items = $contentType->getAvailableItemsByGroup($languageId, $context, $group, $limit, $offset);
            $total = $contentType->getTotalCountByGroup($languageId, $context, $group);
        } else {
            $items = $contentType->getAvailableItems($languageId, $context, $limit, $offset);
            $total = $contentType->getTotalCount($languageId, $context);
        }

        return new JsonResponse([
            'type'  => $type,
            'items' => $items,
            'total' => $total,
        ]);
    }

    #[Route(
        path: '/api/_action/falara/content/{salesChannelId}/snippet/groups',
        name: 'api.action.falara.content.snippet.groups',
        methods: ['GET'],
    )]
    public function getSnippetGroups(
        string $salesChannelId,
        Request $request,
        Context $context,
    ): JsonResponse {
        $contentType = $this->registry->get('snippet');

        if ($contentType === null || !$contentType instanceof SnippetContentType) {
            return new JsonResponse(['error' => 'Snippet content type not available.'], 404);
        }

        $languageId = $this->getDefaultLanguageId($salesChannelId, $context);
        if ($languageId === null) {
            $languageId = $context->getLanguageId();
        }

        // Allow override via query param
        $languageId = $request->query->get('languageId', $languageId);

        $groups = $contentType->getSnippetGroups($languageId, $context);

        return new JsonResponse(['groups' => $groups]);
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

    private function getDefaultLanguageId(string $salesChannelId, Context $context): ?string
    {
        $criteria = new Criteria([$salesChannelId]);
        $salesChannel = $this->salesChannelRepository->search($criteria, $context)->first();

        return $salesChannel?->getLanguageId();
    }
}
