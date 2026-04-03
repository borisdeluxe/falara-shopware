<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\ContentType;

use Falara\TranslationManager\Dto\ImportResult;
use Falara\TranslationManager\Service\ErrorCode;
use Falara\TranslationManager\Service\WordCounter;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\System\Snippet\Files\SnippetFileCollectionFactory;

class SnippetContentType implements ContentTypeInterface
{
    public function __construct(
        private readonly EntityRepository $snippetRepository,
        private readonly EntityRepository $snippetSetRepository,
        private readonly EntityRepository $languageRepository,
        private readonly SnippetFileCollectionFactory $snippetFileCollectionFactory,
        private readonly WordCounter $wordCounter,
        private readonly LoggerInterface $logger,
    ) {}

    public function getType(): string
    {
        return 'snippet';
    }

    public function getLabel(): string
    {
        return 'Snippets';
    }

    public function getTranslatableFields(): array
    {
        return ['value'];
    }

    public function export(array $entityIds, string $sourceLanguageId, Context $context): array
    {
        $merged = $this->getMergedSnippets($sourceLanguageId, $context);

        $texts = [];
        $warnings = [];

        foreach ($entityIds as $key) {
            if (!isset($merged[$key])) {
                $warnings[] = sprintf('Snippet key "%s" not found for source language.', $key);
                continue;
            }

            $entry = $merged[$key];
            $texts[] = [
                'entity_id'   => $key,
                'entity_type' => $this->getType(),
                'field'       => 'value',
                'text'        => $entry['value'],
            ];
        }

        return ['texts' => $texts, 'warnings' => $warnings];
    }

    public function import(array $translations, string $targetLanguageId, Context $context): ImportResult
    {
        $result = new ImportResult();

        $snippetSet = $this->getSnippetSetForLanguage($targetLanguageId, $context);
        if ($snippetSet === null) {
            $this->logger->error('[snippet] No snippet set found for target language.');
            foreach ($translations as $translation) {
                $result->addError(
                    $translation['entity_id'] ?? 'unknown',
                    $this->getType(),
                    'value',
                    ErrorCode::UNKNOWN_WRITE_ERROR->value,
                    'No snippet set found for target language.',
                );
                $result->skipped++;
            }
            return $result;
        }

        $setId = $snippetSet->getId();

        foreach ($translations as $translation) {
            $key  = $translation['entity_id'] ?? null;
            $text = $translation['text'] ?? null;

            if ($key === null || $text === null) {
                continue;
            }

            try {
                // Check if snippet already exists for this set + key
                $criteria = new Criteria();
                $criteria->addFilter(new EqualsFilter('translationKey', $key));
                $criteria->addFilter(new EqualsFilter('setId', $setId));
                $criteria->setLimit(1);
                $existing = $this->snippetRepository->search($criteria, $context)->first();

                if ($existing !== null) {
                    $this->snippetRepository->update([
                        [
                            'id'     => $existing->getId(),
                            'value'  => $text,
                            'author' => 'Falara Translation Manager',
                        ],
                    ], $context);
                } else {
                    $this->snippetRepository->create([
                        [
                            'setId'          => $setId,
                            'translationKey' => $key,
                            'value'          => $text,
                            'author'         => 'Falara Translation Manager',
                        ],
                    ], $context);
                }

                $result->written++;
            } catch (\Throwable $e) {
                $this->logger->error(
                    sprintf('[snippet] Write-back failed for key %s: %s', $key, $e->getMessage()),
                    ['exception' => $e],
                );
                $result->addError(
                    $key,
                    $this->getType(),
                    'value',
                    ErrorCode::UNKNOWN_WRITE_ERROR->value,
                    ErrorCode::UNKNOWN_WRITE_ERROR->message(),
                );
                $result->skipped++;
            }
        }

        return $result;
    }

    public function getAvailableItems(string $languageId, Context $context, int $limit = 50, int $offset = 0): array
    {
        $merged = $this->getMergedSnippets($languageId, $context);

        ksort($merged);
        $keys = array_keys($merged);
        $slice = array_slice($keys, $offset, $limit);

        $items = [];
        foreach ($slice as $key) {
            $entry = $merged[$key];
            $items[] = [
                'id'        => $key,
                'name'      => $key,
                'wordCount' => $this->wordCounter->count($entry['value']),
                'value'     => $entry['value'],
                'author'    => $entry['author'],
                'group'     => $entry['group'] ?? 'unknown',
            ];
        }

        return $items;
    }

    public function getTotalCount(string $languageId, Context $context): int
    {
        return count($this->getMergedSnippets($languageId, $context));
    }

    public function getSnippetGroups(string $languageId, Context $context): array
    {
        $merged = $this->getMergedSnippets($languageId, $context);

        $groupCounts = [];
        foreach ($merged as $entry) {
            $group = $entry['group'] ?? 'unknown';
            if (!isset($groupCounts[$group])) {
                $groupCounts[$group] = 0;
            }
            $groupCounts[$group]++;
        }

        // Sort: Storefront first, then messages/Administration, then alphabetical
        uksort($groupCounts, function (string $a, string $b): int {
            $aLower = strtolower($a);
            $bLower = strtolower($b);
            $aIsStorefront = str_starts_with($aLower, 'storefront');
            $bIsStorefront = str_starts_with($bLower, 'storefront');
            $aIsMessages = str_starts_with($aLower, 'messages');
            $bIsMessages = str_starts_with($bLower, 'messages');

            if ($aIsStorefront && !$bIsStorefront) {
                return -1;
            }
            if (!$aIsStorefront && $bIsStorefront) {
                return 1;
            }
            if ($aIsMessages && !$bIsMessages) {
                return -1;
            }
            if (!$aIsMessages && $bIsMessages) {
                return 1;
            }

            return strcasecmp($a, $b);
        });

        $groups = [];
        foreach ($groupCounts as $name => $count) {
            $groups[] = [
                'name'         => $name,
                'snippetCount' => $count,
            ];
        }

        return $groups;
    }

    public function getAvailableItemsByGroup(string $languageId, Context $context, string $group, int $limit = 50, int $offset = 0): array
    {
        $merged = $this->getMergedSnippets($languageId, $context, $group);

        ksort($merged);
        $keys = array_keys($merged);
        $slice = array_slice($keys, $offset, $limit);

        $items = [];
        foreach ($slice as $key) {
            $entry = $merged[$key];
            $items[] = [
                'id'        => $key,
                'name'      => $key,
                'wordCount' => $this->wordCounter->count($entry['value']),
                'value'     => $entry['value'],
                'author'    => $entry['author'],
                'group'     => $entry['group'] ?? 'unknown',
            ];
        }

        return $items;
    }

    public function getTotalCountByGroup(string $languageId, Context $context, string $group): int
    {
        return count($this->getMergedSnippets($languageId, $context, $group));
    }

    private function getLocaleCodeForLanguage(string $languageId, Context $context): ?string
    {
        $criteria = new Criteria([$languageId]);
        $criteria->addAssociation('locale');

        $language = $this->languageRepository->search($criteria, $context)->first();
        if ($language === null) {
            return null;
        }

        return $language->getLocale()?->getCode();
    }

    private function getSnippetSetForLanguage(string $languageId, Context $context): ?object
    {
        $localeCode = $this->getLocaleCodeForLanguage($languageId, $context);
        if ($localeCode === null) {
            return null;
        }

        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('iso', $localeCode));
        $criteria->setLimit(1);

        return $this->snippetSetRepository->search($criteria, $context)->first();
    }

    private function getPopulatedSnippetFileCollection(): \Shopware\Core\System\Snippet\Files\SnippetFileCollection
    {
        return $this->snippetFileCollectionFactory->createSnippetFileCollection();
    }

    private function getMergedSnippets(string $languageId, Context $context, ?string $group = null): array
    {
        $localeCode = $this->getLocaleCodeForLanguage($languageId, $context);
        if ($localeCode === null) {
            $this->logger->warning('[snippet] Could not resolve locale code for language.', ['languageId' => $languageId]);
            return [];
        }

        $snippets = [];

        // 1. Load from JSON snippet files
        // Try full locale code first (en-GB), then short code (en)
        $collection = $this->getPopulatedSnippetFileCollection();
        $snippetFiles = $collection->getSnippetFilesByIso($localeCode);
        if (empty($snippetFiles)) {
            $shortCode = substr($localeCode, 0, 2);
            $snippetFiles = $collection->getSnippetFilesByIso($shortCode);
        }

        foreach ($snippetFiles as $snippetFile) {
            $fileTechnicalName = $snippetFile->getTechnicalName();

            // If filtering by group, skip non-matching files
            if ($group !== null && $fileTechnicalName !== $group) {
                continue;
            }

            $filePath = $snippetFile->getPath();
            if (!file_exists($filePath)) {
                continue;
            }

            $json = file_get_contents($filePath);
            $data = json_decode($json, true);
            if (!is_array($data)) {
                continue;
            }

            $flat = [];
            $this->flattenSnippetArray($data, '', $snippetFile->getAuthor(), $flat);

            foreach ($flat as $key => $entry) {
                // First file wins for a given key; DB will override later
                if (!isset($snippets[$key])) {
                    $snippets[$key] = [
                        'value'  => $entry['value'],
                        'author' => $entry['author'],
                        'group'  => $fileTechnicalName,
                    ];
                }
            }
        }

        // 2. Overlay with DB snippets (user overrides)
        $snippetSet = $this->getSnippetSetForLanguage($languageId, $context);
        if ($snippetSet !== null) {
            $criteria = new Criteria();
            $criteria->addFilter(new EqualsFilter('setId', $snippetSet->getId()));
            $criteria->setLimit(10000);

            $dbSnippets = $this->snippetRepository->search($criteria, $context);

            foreach ($dbSnippets as $dbSnippet) {
                $key = $dbSnippet->getTranslationKey();

                // If filtering by group and this key belongs to a different group, skip
                if ($group !== null && isset($snippets[$key]) && $snippets[$key]['group'] !== $group) {
                    continue;
                }

                if (isset($snippets[$key])) {
                    // Override value and author from DB
                    $snippets[$key]['value']  = $dbSnippet->getValue();
                    $snippets[$key]['author'] = $dbSnippet->getAuthor() ?? $snippets[$key]['author'];
                } elseif ($group === null) {
                    // DB-only snippet (no JSON source), include only when not filtering by group
                    $snippets[$key] = [
                        'value'  => $dbSnippet->getValue(),
                        'author' => $dbSnippet->getAuthor() ?? 'user',
                        'group'  => 'db-only',
                    ];
                }
            }
        }

        return $snippets;
    }

    private function flattenSnippetArray(array $array, string $prefix, string $author, array &$result): void
    {
        foreach ($array as $key => $value) {
            $fullKey = $prefix === '' ? (string) $key : $prefix . '.' . (string) $key;

            if (is_array($value)) {
                $this->flattenSnippetArray($value, $fullKey, $author, $result);
            } else {
                $result[$fullKey] = [
                    'value'  => (string) $value,
                    'author' => $author,
                ];
            }
        }
    }
}
