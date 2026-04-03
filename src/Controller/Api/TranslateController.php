<?php declare(strict_types=1);

namespace Falara\TranslationManager\Controller\Api;

use Falara\TranslationManager\Core\ContentType\ContentTypeRegistry;
use Falara\TranslationManager\Service\ConnectionService;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsAnyFilter;
use Shopware\Core\Framework\Uuid\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
class TranslateController extends AbstractController
{
    public function __construct(
        private readonly ConnectionService $connectionService,
        private readonly ContentTypeRegistry $registry,
        private readonly EntityRepository $jobRepository,
    ) {}

    #[Route(
        path: '/api/_action/falara/translate',
        name: 'api.action.falara.translate',
        methods: ['POST'],
    )]
    public function translate(Request $request, Context $context): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $salesChannelId = $data['salesChannelId'] ?? '';
        $resourceType   = $data['resourceType'] ?? '';
        $entityIds      = $data['entityIds'] ?? [];
        $sourceLocale   = $data['sourceLocale'] ?? '';
        $targetLocales  = $data['targetLocales'] ?? [];
        $options        = $data['options'] ?? [];
        $projectName    = $data['projectName'] ?? null;

        if ($salesChannelId === '' || $resourceType === '' || empty($entityIds) || $sourceLocale === '' || empty($targetLocales)) {
            return new JsonResponse(
                ['error' => 'salesChannelId, resourceType, entityIds, sourceLocale and targetLocales are required.'],
                400,
            );
        }

        $contentType = $this->registry->get($resourceType);
        if ($contentType === null) {
            return new JsonResponse(['error' => sprintf('Unknown content type "%s".', $resourceType)], 404);
        }

        // Server-side duplicate check: look for in-flight jobs with same resourceType + any targetLocale
        foreach ($targetLocales as $targetLocale) {
            $criteria = new Criteria();
            $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));
            $criteria->addFilter(new EqualsFilter('resourceType', $resourceType));
            $criteria->addFilter(new EqualsFilter('targetLocale', $targetLocale));
            $criteria->addFilter(new EqualsAnyFilter('status', ['pending', 'processing', 'queued']));
            $criteria->setLimit(1);

            $existing = $this->jobRepository->searchIds($criteria, $context);
            if ($existing->getTotal() > 0) {
                return new JsonResponse([
                    'error'       => sprintf(
                        'An in-flight job for resource type "%s" and locale "%s" already exists.',
                        $resourceType,
                        $targetLocale,
                    ),
                    'conflictLocale' => $targetLocale,
                ], 409);
            }
        }

        // Export content
        try {
            $texts = $contentType->export($entityIds, $sourceLocale, $context);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }

        if (empty($texts)) {
            return new JsonResponse(['error' => 'No translatable content found for the given entity IDs.'], 422);
        }

        // Submit to Falara API
        try {
            $apiClient = $this->connectionService->getApiClient($salesChannelId, $context);
            $batch     = $apiClient->createTranslationJob($texts, $sourceLocale, $targetLocales, $options);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => 'Falara API submission failed: ' . $e->getMessage()], 502);
        }

        // Persist local job records
        $jobRecords = [];
        $jobIds     = [];

        foreach ($batch->jobs as $apiJob) {
            $localId = Uuid::randomHex();
            $jobIds[] = $localId;

            $jobRecords[] = [
                'id'            => $localId,
                'salesChannelId'=> $salesChannelId,
                'falaraJobId'   => $apiJob->jobId,
                'batchId'       => $batch->batchId,
                'status'        => 'pending',
                'resourceType'  => $resourceType,
                'resourceCount' => count($entityIds),
                'targetLocale'  => $apiJob->targetLang,
                'projectName'   => $projectName,
            ];
        }

        try {
            $this->jobRepository->create($jobRecords, $context);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => 'Failed to persist job records: ' . $e->getMessage()], 500);
        }

        return new JsonResponse([
            'jobIds'  => $jobIds,
            'batchId' => $batch->batchId,
        ]);
    }
}
