<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\ContentType;

use Falara\TranslationManager\Dto\ImportResult;
use Falara\TranslationManager\Service\WordCounter;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\NotFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\Filter;

class ProductContentType extends AbstractContentType
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
        return 'product';
    }

    public function getLabel(): string
    {
        return 'Products';
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

        $criteria = new Criteria($entityIds);
        $products  = $this->repository->search($criteria, $langContext);

        $result = [];
        foreach ($products as $product) {
            $entity = [
                'name'            => $product->getName(),
                'description'     => $product->getDescription(),
                'metaTitle'       => $product->getMetaTitle(),
                'metaDescription' => $product->getMetaDescription(),
                'keywords'        => $product->getKeywords(),
            ];

            $texts = $this->buildTexts($entity, $product->getId(), $this->getType(), self::FIELDS);

            $result[] = [
                'entity_id'   => $product->getId(),
                'entity_type' => $this->getType(),
                'texts'       => $texts,
                'metadata'    => [
                    'productNumber' => $product->getProductNumber(),
                ],
            ];
        }

        return $result;
    }

    public function getAvailableItems(string $languageId, Context $context, int $limit = 50, int $offset = 0): array
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('parentId', null));
        $criteria->setLimit($limit);
        $criteria->setOffset($offset);
        $criteria->addSorting(new FieldSorting('name', FieldSorting::ASCENDING));

        $products = $this->repository->search($criteria, $context);

        $items = [];
        foreach ($products as $product) {
            $items[] = [
                'id'        => $product->getId(),
                'name'      => $product->getName() ?? '',
                'wordCount' => $this->wordCounter->countFields(array_filter([
                    $product->getName(),
                    $product->getDescription(),
                    $product->getMetaTitle(),
                    $product->getMetaDescription(),
                    $product->getKeywords(),
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

        return $this->repository->search($criteria, $langContext)->getTotal();
    }
}
