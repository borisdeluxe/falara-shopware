<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\ContentType;

use Falara\TranslationManager\Service\WordCounter;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;

class CategoryContentType extends AbstractContentType
{
    private const FIELDS = ['name', 'description', 'metaTitle', 'metaDescription', 'keywords'];

    public function __construct(
        EntityRepository $repository,
        WordCounter $wordCounter,
        LoggerInterface $logger,
    ) {
        parent::__construct($repository, $wordCounter, $logger);
    }

    public function getType(): string
    {
        return 'category';
    }

    public function getLabel(): string
    {
        return 'Categories';
    }

    public function getTranslatableFields(): array
    {
        return self::FIELDS;
    }

    public function getSkipFields(): array
    {
        return ['slug'];
    }

    public function export(array $entityIds, string $sourceLanguageId, Context $context): array
    {
        $langContext = $this->createContextWithLanguage($sourceLanguageId, $context);

        $criteria   = new Criteria($entityIds);
        $categories = $this->repository->search($criteria, $context);

        $result = [];
        foreach ($categories as $category) {
            $entity = [
                'name'            => $category->getName(),
                'description'     => $category->getDescription(),
                'metaTitle'       => $category->getMetaTitle(),
                'metaDescription' => $category->getMetaDescription(),
                'keywords'        => $category->getKeywords(),
            ];

            $texts = $this->buildTexts($entity, $category->getId(), $this->getType(), self::FIELDS);

            $result[] = [
                'entity_id'   => $category->getId(),
                'entity_type' => $this->getType(),
                'texts'       => $texts,
                'metadata'    => [
                    'path' => $category->getPath(),
                    'type' => $category->getType(),
                ],
            ];
        }

        return $result;
    }

    public function getAvailableItems(string $languageId, Context $context, int $limit = 50, int $offset = 0): array
    {
        $langContext = $this->createContextWithLanguage($languageId, $context);

        $criteria = new Criteria();
        $criteria->setLimit($limit);
        $criteria->setOffset($offset);

        $categories = $this->repository->search($criteria, $context);

        $items = [];
        foreach ($categories as $category) {
            $items[] = [
                'id'        => $category->getId(),
                'name'      => $category->getName() ?? '',
                'breadcrumb' => $category->getBreadcrumb() ?? [],
                'wordCount' => $this->wordCounter->countFields(array_filter([
                    $category->getName(),
                    $category->getDescription(),
                    $category->getMetaTitle(),
                    $category->getMetaDescription(),
                    $category->getKeywords(),
                ])),
            ];
        }

        return $items;
    }

    public function getTotalCount(string $languageId, Context $context): int
    {
        $langContext = $this->createContextWithLanguage($languageId, $context);
        $criteria    = new Criteria();
        $criteria->setLimit(1);

        return $this->repository->search($criteria, $context)->getTotal();
    }
}
