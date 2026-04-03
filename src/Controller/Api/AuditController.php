<?php declare(strict_types=1);

namespace Falara\TranslationManager\Controller\Api;

use Falara\TranslationManager\Core\ContentType\ContentTypeRegistry;
use Falara\TranslationManager\Service\ConnectionService;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
class AuditController extends AbstractController
{
    public function __construct(
        private readonly ContentTypeRegistry $registry,
        private readonly ConnectionService $connectionService,
        private readonly EntityRepository $jobRepository,
    ) {}

    #[Route(
        path: '/api/_action/falara/audit/{salesChannelId}',
        name: 'api.action.falara.audit',
        methods: ['GET'],
    )]
    public function audit(string $salesChannelId, Request $request, Context $context): JsonResponse
    {
        $sourceLanguageId = $request->query->get('sourceLanguageId', $context->getLanguageId());
        $targetLanguageIds = array_filter(
            explode(',', (string) $request->query->get('targetLanguageIds', '')),
        );

        $coverage = [];

        foreach ($this->registry->all() as $typeName => $contentType) {
            $totalCount = $contentType->getTotalCount($sourceLanguageId, $context);

            // Count words for source
            $sourceWordCount = 0;
            $offset          = 0;
            $pageSize        = 100;

            while (true) {
                $items = $contentType->getAvailableItems($sourceLanguageId, $context, $pageSize, $offset);
                if (empty($items)) {
                    break;
                }
                foreach ($items as $item) {
                    $sourceWordCount += (int) ($item['wordCount'] ?? 0);
                }
                $offset += $pageSize;
                if (count($items) < $pageSize) {
                    break;
                }
            }

            $perLocale = [];

            foreach ($targetLanguageIds as $targetLanguageId) {
                $targetWordCount = 0;
                $offset          = 0;

                while (true) {
                    $items = $contentType->getAvailableItems($targetLanguageId, $context, $pageSize, $offset);
                    if (empty($items)) {
                        break;
                    }
                    foreach ($items as $item) {
                        $targetWordCount += (int) ($item['wordCount'] ?? 0);
                    }
                    $offset += $pageSize;
                    if (count($items) < $pageSize) {
                        break;
                    }
                }

                $coveragePercent = $sourceWordCount > 0
                    ? round(($targetWordCount / $sourceWordCount) * 100, 1)
                    : 0.0;

                $perLocale[$targetLanguageId] = [
                    'wordCount'       => $targetWordCount,
                    'coveragePercent' => $coveragePercent,
                ];
            }

            $coverage[] = [
                'type'            => $typeName,
                'label'           => $contentType->getLabel(),
                'totalItems'      => $totalCount,
                'sourceWordCount' => $sourceWordCount,
                'perLocale'       => $perLocale,
            ];
        }

        return new JsonResponse([
            'salesChannelId'  => $salesChannelId,
            'sourceLanguageId'=> $sourceLanguageId,
            'coverage'        => $coverage,
        ]);
    }
}
