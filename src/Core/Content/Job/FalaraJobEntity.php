<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\Content\Job;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;
use Shopware\Core\System\SalesChannel\SalesChannelEntity;

class FalaraJobEntity extends Entity
{
    use EntityIdTrait;

    protected ?string $salesChannelId = null;

    protected ?string $falaraJobId = null;

    protected ?string $batchId = null;

    protected ?string $status = 'pending';

    protected ?string $resourceType = null;

    protected ?int $resourceCount = 0;

    protected ?string $targetLocale = null;

    protected ?int $wordCount = 0;

    protected ?string $projectName = null;

    protected ?bool $archived = false;

    protected ?array $exportWarnings = null;

    protected ?array $writebackErrors = null;

    protected ?\DateTimeInterface $completedAt = null;

    protected ?SalesChannelEntity $salesChannel = null;

    public function getSalesChannelId(): ?string
    {
        return $this->salesChannelId;
    }

    public function setSalesChannelId(?string $salesChannelId): void
    {
        $this->salesChannelId = $salesChannelId;
    }

    public function getFalaraJobId(): ?string
    {
        return $this->falaraJobId;
    }

    public function setFalaraJobId(?string $falaraJobId): void
    {
        $this->falaraJobId = $falaraJobId;
    }

    public function getBatchId(): ?string
    {
        return $this->batchId;
    }

    public function setBatchId(?string $batchId): void
    {
        $this->batchId = $batchId;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(?string $status): void
    {
        $this->status = $status;
    }

    public function getResourceType(): ?string
    {
        return $this->resourceType;
    }

    public function setResourceType(?string $resourceType): void
    {
        $this->resourceType = $resourceType;
    }

    public function getResourceCount(): ?int
    {
        return $this->resourceCount;
    }

    public function setResourceCount(?int $resourceCount): void
    {
        $this->resourceCount = $resourceCount;
    }

    public function getTargetLocale(): ?string
    {
        return $this->targetLocale;
    }

    public function setTargetLocale(?string $targetLocale): void
    {
        $this->targetLocale = $targetLocale;
    }

    public function getWordCount(): ?int
    {
        return $this->wordCount;
    }

    public function setWordCount(?int $wordCount): void
    {
        $this->wordCount = $wordCount;
    }

    public function getProjectName(): ?string
    {
        return $this->projectName;
    }

    public function setProjectName(?string $projectName): void
    {
        $this->projectName = $projectName;
    }

    public function getArchived(): ?bool
    {
        return $this->archived;
    }

    public function setArchived(?bool $archived): void
    {
        $this->archived = $archived;
    }

    public function getExportWarnings(): ?array
    {
        return $this->exportWarnings;
    }

    public function setExportWarnings(?array $exportWarnings): void
    {
        $this->exportWarnings = $exportWarnings;
    }

    public function getWritebackErrors(): ?array
    {
        return $this->writebackErrors;
    }

    public function setWritebackErrors(?array $writebackErrors): void
    {
        $this->writebackErrors = $writebackErrors;
    }

    public function getCompletedAt(): ?\DateTimeInterface
    {
        return $this->completedAt;
    }

    public function setCompletedAt(?\DateTimeInterface $completedAt): void
    {
        $this->completedAt = $completedAt;
    }

    public function getSalesChannel(): ?SalesChannelEntity
    {
        return $this->salesChannel;
    }

    public function setSalesChannel(?SalesChannelEntity $salesChannel): void
    {
        $this->salesChannel = $salesChannel;
    }
}
