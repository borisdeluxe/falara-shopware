<?php declare(strict_types=1);

namespace Falara\TranslationManager\Core\Content\Connection;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;
use Shopware\Core\System\SalesChannel\SalesChannelEntity;

class FalaraConnectionEntity extends Entity
{
    use EntityIdTrait;

    protected ?string $salesChannelId = null;

    protected ?string $falaraApiKey = null;

    protected ?string $falaraAccountId = null;

    protected ?string $webhookSecret = null;

    protected ?\DateTimeInterface $disconnectedAt = null;

    protected ?SalesChannelEntity $salesChannel = null;

    public function getSalesChannelId(): ?string
    {
        return $this->salesChannelId;
    }

    public function setSalesChannelId(?string $salesChannelId): void
    {
        $this->salesChannelId = $salesChannelId;
    }

    public function getFalaraApiKey(): ?string
    {
        return $this->falaraApiKey;
    }

    public function setFalaraApiKey(?string $falaraApiKey): void
    {
        $this->falaraApiKey = $falaraApiKey;
    }

    public function getFalaraAccountId(): ?string
    {
        return $this->falaraAccountId;
    }

    public function setFalaraAccountId(?string $falaraAccountId): void
    {
        $this->falaraAccountId = $falaraAccountId;
    }

    public function getWebhookSecret(): ?string
    {
        return $this->webhookSecret;
    }

    public function setWebhookSecret(?string $webhookSecret): void
    {
        $this->webhookSecret = $webhookSecret;
    }

    public function getDisconnectedAt(): ?\DateTimeInterface
    {
        return $this->disconnectedAt;
    }

    public function setDisconnectedAt(?\DateTimeInterface $disconnectedAt): void
    {
        $this->disconnectedAt = $disconnectedAt;
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
