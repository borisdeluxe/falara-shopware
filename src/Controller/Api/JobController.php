<?php declare(strict_types=1);

namespace Falara\TranslationManager\Controller\Api;

use Falara\TranslationManager\Core\Content\Job\FalaraJobEntity;
use Falara\TranslationManager\MessageQueue\FalaraWriteBackMessage;
use Falara\TranslationManager\Service\JobStatus;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
class JobController extends AbstractController
{
    public function __construct(
        private readonly EntityRepository $jobRepository,
        private readonly MessageBusInterface $messageBus,
    ) {}

    #[Route(
        path: '/api/_action/falara/jobs/{salesChannelId}',
        name: 'api.action.falara.jobs.list',
        methods: ['GET'],
    )]
    public function listJobs(string $salesChannelId, Request $request, Context $context): JsonResponse
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));
        $criteria->addSorting(new FieldSorting('createdAt', FieldSorting::DESCENDING));

        $archived = $request->query->get('archived');
        if ($archived !== null) {
            $criteria->addFilter(new EqualsFilter('archived', $archived === 'true' || $archived === '1'));
        }

        $limit  = max(1, (int) $request->query->get('limit', 50));
        $offset = max(0, (int) $request->query->get('offset', 0));
        $criteria->setLimit($limit);
        $criteria->setOffset($offset);

        $result = $this->jobRepository->search($criteria, $context);

        $jobs = [];
        foreach ($result as $job) {
            $jobs[] = $this->serializeJob($job);
        }

        return new JsonResponse([
            'jobs'  => $jobs,
            'total' => $result->getTotal(),
        ]);
    }

    #[Route(
        path: '/api/_action/falara/jobs/detail/{id}',
        name: 'api.action.falara.jobs.detail',
        methods: ['GET'],
    )]
    public function getJob(string $id, Context $context): JsonResponse
    {
        $criteria = new Criteria([$id]);
        $job      = $this->jobRepository->search($criteria, $context)->first();

        if ($job === null) {
            return new JsonResponse(['error' => 'Job not found.'], 404);
        }

        return new JsonResponse($this->serializeJob($job));
    }

    #[Route(
        path: '/api/_action/falara/jobs/{id}/retry',
        name: 'api.action.falara.jobs.retry',
        methods: ['POST'],
    )]
    public function retryJob(string $id, Context $context): JsonResponse
    {
        $criteria = new Criteria([$id]);
        $job      = $this->jobRepository->search($criteria, $context)->first();

        if ($job === null) {
            return new JsonResponse(['error' => 'Job not found.'], 404);
        }

        if ($job->getStatus() !== JobStatus::WRITEBACK_FAILED) {
            return new JsonResponse(
                ['error' => sprintf('Job status is "%s", only "%s" jobs can be retried.', $job->getStatus(), JobStatus::WRITEBACK_FAILED)],
                409,
            );
        }

        $this->messageBus->dispatch(new FalaraWriteBackMessage($id, $job->getSalesChannelId()));

        return new JsonResponse(['success' => true]);
    }

    #[Route(
        path: '/api/_action/falara/jobs/{id}/archive',
        name: 'api.action.falara.jobs.archive',
        methods: ['PATCH'],
    )]
    public function toggleArchive(string $id, Request $request, Context $context): JsonResponse
    {
        $criteria = new Criteria([$id]);
        $job      = $this->jobRepository->search($criteria, $context)->first();

        if ($job === null) {
            return new JsonResponse(['error' => 'Job not found.'], 404);
        }

        $data     = json_decode($request->getContent(), true) ?? [];
        $archived = isset($data['archived']) ? (bool) $data['archived'] : !$job->getArchived();

        $this->jobRepository->update([['id' => $id, 'archived' => $archived]], $context);

        return new JsonResponse(['id' => $id, 'archived' => $archived]);
    }

    private function serializeJob(FalaraJobEntity $job): array
    {
        return [
            'id'             => $job->getId(),
            'falaraJobId'    => $job->getFalaraJobId(),
            'batchId'        => $job->getBatchId(),
            'status'         => $job->getStatus(),
            'resourceType'   => $job->getResourceType(),
            'resourceCount'  => $job->getResourceCount(),
            'targetLocale'   => $job->getTargetLocale(),
            'wordCount'      => $job->getWordCount(),
            'projectName'    => $job->getProjectName(),
            'archived'       => $job->getArchived(),
            'exportWarnings' => $job->getExportWarnings(),
            'writebackErrors'=> $job->getWritebackErrors(),
            'completedAt'    => $job->getCompletedAt()?->format(\DateTimeInterface::ATOM),
        ];
    }
}
