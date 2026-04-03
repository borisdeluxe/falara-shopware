<?php declare(strict_types=1);

namespace Falara\TranslationManager\Controller\Api;

use Falara\TranslationManager\Service\ConnectionService;
use Shopware\Core\Framework\Context;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

#[Route(defaults: ['_routeScope' => ['api']])]
class ConnectionController extends AbstractController
{
    public function __construct(
        private readonly ConnectionService $connectionService,
    ) {}

    #[Route(
        path: '/api/_action/falara/connect',
        name: 'api.action.falara.connect',
        methods: ['POST'],
    )]
    public function connect(Request $request, Context $context): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $apiKey         = $data['apiKey'] ?? '';
        $salesChannelId = $data['salesChannelId'] ?? '';

        if ($apiKey === '' || $salesChannelId === '') {
            return new JsonResponse(
                ['error' => 'apiKey and salesChannelId are required.'],
                400,
            );
        }

        // Auto-generate webhook URL from current request
        $webhookUrl = $request->getSchemeAndHttpHost() . '/api/_action/falara/webhook';

        try {
            $result = $this->connectionService->connect($apiKey, $salesChannelId, $webhookUrl, $context);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }

        return new JsonResponse($result);
    }

    #[Route(
        path: '/api/_action/falara/disconnect',
        name: 'api.action.falara.disconnect',
        methods: ['POST'],
    )]
    public function disconnect(Request $request, Context $context): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $salesChannelId = $data['salesChannelId'] ?? '';

        if ($salesChannelId === '') {
            return new JsonResponse(['error' => 'salesChannelId is required.'], 400);
        }

        $this->connectionService->disconnect($salesChannelId, $context);

        return new JsonResponse(['success' => true]);
    }

    #[Route(
        path: '/api/_action/falara/connection/{salesChannelId}',
        name: 'api.action.falara.connection.get',
        methods: ['GET'],
    )]
    public function getConnection(string $salesChannelId, Context $context): JsonResponse
    {
        $connection = $this->connectionService->getConnection($salesChannelId, $context);

        if ($connection === null) {
            return new JsonResponse(['connection' => null]);
        }

        // Enrich with account info from Falara API
        try {
            $apiClient = $this->connectionService->getApiClient($salesChannelId, $context);
            $account = $apiClient->getAccount();
            $connection['accountName'] = $account->name;
            $connection['plan'] = $account->plan;
        } catch (\Throwable $e) {
            // Non-critical, continue without account name
        }

        return new JsonResponse(['connection' => $connection]);
    }
}
