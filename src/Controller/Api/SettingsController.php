<?php declare(strict_types=1);

namespace Falara\TranslationManager\Controller\Api;

use Falara\TranslationManager\Service\ConnectionService;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\Uuid\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
class SettingsController extends AbstractController
{
    public function __construct(
        private readonly EntityRepository $translationDefaultRepository,
        private readonly EntityRepository $customFieldWhitelistRepository,
        private readonly ConnectionService $connectionService,
        private readonly EntityRepository $customFieldSetRepository,
    ) {}

    // -------------------------------------------------------------------------
    // Translation Defaults
    // -------------------------------------------------------------------------

    #[Route(
        path: '/api/_action/falara/settings/defaults/{salesChannelId}',
        name: 'api.action.falara.settings.defaults.get',
        methods: ['GET'],
    )]
    public function getDefaults(string $salesChannelId, Context $context): JsonResponse
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));
        $criteria->setLimit(1);

        $defaults = $this->translationDefaultRepository->search($criteria, $context)->first();

        if ($defaults === null) {
            return new JsonResponse(['defaults' => null]);
        }

        return new JsonResponse([
            'defaults' => [
                'id'             => $defaults->getId(),
                'salesChannelId' => $defaults->getSalesChannelId(),
                'glossaryId'     => $defaults->getGlossaryId(),
                'domain'         => $defaults->getDomain(),
                'tone'           => $defaults->getTone(),
                'quality'        => $defaults->getQuality(),
                'instructions'   => $defaults->getInstructions(),
            ],
        ]);
    }

    #[Route(
        path: '/api/_action/falara/settings/defaults/{salesChannelId}',
        name: 'api.action.falara.settings.defaults.save',
        methods: ['POST'],
    )]
    public function saveDefaults(string $salesChannelId, Request $request, Context $context): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));
        $criteria->setLimit(1);

        $existing = $this->translationDefaultRepository->search($criteria, $context)->first();
        $id       = $existing?->getId() ?? Uuid::randomHex();

        $payload = [
            'id'             => $id,
            'salesChannelId' => $salesChannelId,
            'quality'        => $data['quality'] ?? 'standard',
        ];

        if (array_key_exists('glossaryId', $data))   { $payload['glossaryId']   = $data['glossaryId'];   }
        if (array_key_exists('domain', $data))        { $payload['domain']        = $data['domain'];        }
        if (array_key_exists('tone', $data))          { $payload['tone']          = $data['tone'];          }
        if (array_key_exists('instructions', $data))  { $payload['instructions']  = $data['instructions'];  }

        if ($existing === null) {
            $this->translationDefaultRepository->create([$payload], $context);
        } else {
            $this->translationDefaultRepository->update([$payload], $context);
        }

        return new JsonResponse(['id' => $id, 'success' => true]);
    }

    // -------------------------------------------------------------------------
    // Glossaries — proxy to Falara API
    // -------------------------------------------------------------------------

    #[Route(
        path: '/api/_action/falara/settings/glossaries/{salesChannelId}',
        name: 'api.action.falara.settings.glossaries',
        methods: ['GET'],
    )]
    public function getGlossaries(string $salesChannelId, Context $context): JsonResponse
    {
        try {
            $apiClient  = $this->connectionService->getApiClient($salesChannelId, $context);
            $glossaries = $apiClient->getGlossaries();
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage()], 502);
        }

        return new JsonResponse(['glossaries' => $glossaries]);
    }

    // -------------------------------------------------------------------------
    // Usage — proxy to Falara API
    // -------------------------------------------------------------------------

    #[Route(
        path: '/api/_action/falara/settings/usage/{salesChannelId}',
        name: 'api.action.falara.settings.usage',
        methods: ['GET'],
    )]
    public function getUsage(string $salesChannelId, Context $context): JsonResponse
    {
        try {
            $apiClient = $this->connectionService->getApiClient($salesChannelId, $context);
            $usage     = $apiClient->getUsage();
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage()], 502);
        }

        return new JsonResponse([
            'usage' => [
                'wordsUsed'           => $usage->wordsUsed,
                'wordsLimit'          => $usage->wordsLimit,
                'wordsRemaining'      => $usage->wordsRemaining,
                'plan'                => $usage->plan,
                'bonusWordsAvailable' => $usage->bonusWordsAvailable,
                'percentUsed'         => $usage->getPercentUsed(),
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // Custom Field Whitelist — CRUD
    // -------------------------------------------------------------------------

    #[Route(
        path: '/api/_action/falara/settings/custom-fields/{salesChannelId}',
        name: 'api.action.falara.settings.custom_fields.list',
        methods: ['GET'],
    )]
    public function listCustomFields(string $salesChannelId, Context $context): JsonResponse
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));

        $result = $this->customFieldWhitelistRepository->search($criteria, $context);

        $fields = [];
        foreach ($result as $entry) {
            $fields[] = [
                'id'             => $entry->getId(),
                'salesChannelId' => $entry->getSalesChannelId(),
                'fieldSetName'   => $entry->getFieldSetName(),
                'fieldName'      => $entry->getFieldName(),
            ];
        }

        return new JsonResponse(['customFields' => $fields]);
    }

    #[Route(
        path: '/api/_action/falara/settings/custom-fields/{salesChannelId}',
        name: 'api.action.falara.settings.custom_fields.create',
        methods: ['POST'],
    )]
    public function createCustomField(string $salesChannelId, Request $request, Context $context): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $fieldSetName = $data['fieldSetName'] ?? '';
        $fieldName    = $data['fieldName'] ?? '';

        if ($fieldSetName === '' || $fieldName === '') {
            return new JsonResponse(['error' => 'fieldSetName and fieldName are required.'], 400);
        }

        // Idempotent: skip if already whitelisted
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));
        $criteria->addFilter(new EqualsFilter('fieldSetName', $fieldSetName));
        $criteria->addFilter(new EqualsFilter('fieldName', $fieldName));
        $criteria->setLimit(1);

        $existing = $this->customFieldWhitelistRepository->search($criteria, $context)->first();
        if ($existing !== null) {
            return new JsonResponse(['id' => $existing->getId(), 'success' => true, 'existed' => true]);
        }

        $id = Uuid::randomHex();
        $this->customFieldWhitelistRepository->create([[
            'id'             => $id,
            'salesChannelId' => $salesChannelId,
            'fieldSetName'   => $fieldSetName,
            'fieldName'      => $fieldName,
        ]], $context);

        return new JsonResponse(['id' => $id, 'success' => true], 201);
    }

    #[Route(
        path: '/api/_action/falara/settings/custom-fields/entry/{id}',
        name: 'api.action.falara.settings.custom_fields.delete',
        methods: ['DELETE'],
    )]
    public function deleteCustomField(string $id, Context $context): JsonResponse
    {
        $criteria = new Criteria([$id]);
        $entry    = $this->customFieldWhitelistRepository->search($criteria, $context)->first();

        if ($entry === null) {
            return new JsonResponse(['error' => 'Entry not found.'], 404);
        }

        $this->customFieldWhitelistRepository->delete([['id' => $id]], $context);

        return new JsonResponse(['success' => true]);
    }

    // -------------------------------------------------------------------------
    // Available Custom Fields — from Shopware DAL
    // -------------------------------------------------------------------------

    #[Route(
        path: '/api/_action/falara/settings/available-custom-fields/{salesChannelId}',
        name: 'api.action.falara.settings.available_custom_fields',
        methods: ['GET'],
    )]
    public function getAvailableCustomFields(string $salesChannelId, Context $context): JsonResponse
    {
        $translatableTypes = ['text', 'html', 'textarea'];

        $criteria = new Criteria();
        $criteria->addAssociation('customFields');
        $criteria->addAssociation('relations');

        $sets = $this->customFieldSetRepository->search($criteria, $context);

        $result = [];
        foreach ($sets as $set) {
            $config = $set->getConfig() ?? [];
            $label  = $config['label']['en-GB'] ?? $config['label']['de-DE'] ?? $set->getName();

            // Determine entity from relations
            $entity = null;
            if ($set->getRelations() !== null) {
                foreach ($set->getRelations() as $relation) {
                    $entity = $relation->getEntityName();
                    break;
                }
            }

            $fields = [];
            if ($set->getCustomFields() !== null) {
                foreach ($set->getCustomFields() as $field) {
                    $fieldConfig = $field->getConfig() ?? [];
                    $fieldLabel  = $fieldConfig['label']['en-GB'] ?? $fieldConfig['label']['de-DE'] ?? $field->getName();
                    $fieldType   = $field->getType();

                    $fields[] = [
                        'name'         => $field->getName(),
                        'label'        => $fieldLabel,
                        'type'         => $fieldType,
                        'translatable' => in_array($fieldType, $translatableTypes, true),
                    ];
                }
            }

            $result[] = [
                'name'   => $set->getName(),
                'label'  => $label,
                'entity' => $entity,
                'fields' => $fields,
            ];
        }

        return new JsonResponse(['sets' => $result]);
    }
}
