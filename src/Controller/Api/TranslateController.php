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

        // Server-side duplicate check: look for in-flight jobs with same resourceType + each targetLocale
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
                    'error'          => sprintf(
                        'An in-flight job for resource type "%s" and locale "%s" already exists.',
                        $resourceType,
                        $targetLocale,
                    ),
                    'conflictLocale' => $targetLocale,
                ], 409);
            }
        }

        // Determine source language ID for DAL export and BCP-47 code for API
        $sourceLanguageId = $sourceLocale;
        $sourceLang = $data['sourceLang'] ?? 'en';

        // Export content using Shopware language ID
        try {
            $exportResult = $contentType->export($entityIds, $sourceLanguageId, $context);
            $texts = $exportResult['texts'] ?? $exportResult;
            $warnings = $exportResult['warnings'] ?? [];
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }

        if (empty($texts)) {
            return new JsonResponse(['error' => 'No translatable content found for the given entity IDs.'], 422);
        }

        $exportWarnings = !empty($warnings) ? array_map(fn($w) => $w->toArray(), $warnings) : null;

        // Submit to Falara API
        try {
            $apiClient = $this->connectionService->getApiClient($salesChannelId, $context);
            $batch     = $apiClient->createTranslationJob($texts, $sourceLang, $targetLocales, $options);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => 'Falara API submission failed: ' . $e->getMessage()], 502);
        }

        // Persist local job records — batch->jobs is an array of associative arrays
        $jobRecords = [];
        $jobIds     = [];

        foreach ($batch->jobs as $apiJob) {
            $localId  = Uuid::randomHex();
            $jobIds[] = $localId;

            // Single-target batches have one job per target locale in request order;
            // multi-target responses carry target_lang in each job entry.
            $targetLocale = $apiJob['target_language'] ?? $apiJob['target_lang'] ?? ($targetLocales[0] ?? '');
            $falaraJobId  = $apiJob['job_id'] ?? '';

            $jobRecords[] = [
                'id'            => $localId,
                'salesChannelId'=> $salesChannelId,
                'falaraJobId'   => $falaraJobId,
                'batchId'       => $batch->batchId,
                'status'        => 'pending',
                'resourceType'  => $resourceType,
                'resourceCount' => count($entityIds),
                'targetLocale'  => $targetLocale,
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
