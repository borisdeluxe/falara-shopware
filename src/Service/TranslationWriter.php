<?php declare(strict_types=1);

namespace Falara\TranslationManager\Service;

use Doctrine\DBAL\Connection;
use Falara\TranslationManager\Core\ContentType\ContentTypeRegistry;
use Falara\TranslationManager\Dto\FalaraJobResult;
use Falara\TranslationManager\Dto\ImportResult;
use Falara\TranslationManager\Dto\WriteBackResult;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Uuid\Uuid;

class TranslationWriter
{
    public function __construct(
        private readonly Connection $connection,
        private readonly ContentTypeRegistry $registry,
        private readonly EntityRepository $jobRepository,
        private readonly LoggerInterface $logger,
    ) {}

    /**
     * Atomically claims a job for write-back.
     * Returns true if the job was successfully claimed, false if already claimed or not found.
     */
    public function claimJob(string $jobId): bool
    {
        $affected = $this->connection->executeStatement(
            'UPDATE falara_job SET status = :newStatus, updated_at = NOW(3)
             WHERE id = :id AND status IN (:statusCompleted, :statusNeedsReview)',
            [
                'newStatus'        => JobStatus::WRITING_BACK,
                'id'               => Uuid::fromHexToBytes($jobId),
                'statusCompleted'  => JobStatus::COMPLETED,
                'statusNeedsReview'=> JobStatus::NEEDS_REVIEW,
            ],
        );

        return $affected > 0;
    }

    /**
     * Writes translations back to Shopware entities.
     * Groups by entity_type from translation metadata, dispatches to the matching ContentType.
     */
    public function writeBack(FalaraJobResult $result, string $targetLanguageId, Context $context): WriteBackResult
    {
        // Group translations by entity_type from their metadata
        $byType = [];
        foreach ($result->translations as $translation) {
            $entityType = $translation['metadata']['entity_type'] ?? 'unknown';
            $byType[$entityType][] = $translation;
        }

        $merged = new ImportResult();

        foreach ($byType as $entityType => $translations) {
            $contentType = $this->registry->get($entityType);

            if ($contentType === null) {
                $this->logger->warning('TranslationWriter: no ContentType registered for entity_type', [
                    'entity_type' => $entityType,
                    'job_id'      => $result->jobId,
                ]);

                foreach ($translations as $t) {
                    $importResult = new ImportResult();
                    $importResult->addError(
                        entityId:   $t['metadata']['entity_id'] ?? 'unknown',
                        entityType: $entityType,
                        field:      '',
                        code:       'UNKNOWN_ENTITY_TYPE',
                        message:    "No ContentType handler registered for '{$entityType}'.",
                    );
                    $merged->merge($importResult);
                }

                continue;
            }

            try {
                $importResult = $contentType->import($translations, $targetLanguageId, $context);
                $merged->merge($importResult);
            } catch (\Throwable $e) {
                $this->logger->error('TranslationWriter: ContentType::import() threw', [
                    'entity_type' => $entityType,
                    'job_id'      => $result->jobId,
                    'error'       => $e->getMessage(),
                ]);

                $importResult = new ImportResult();
                $importResult->addError(
                    entityId:   '',
                    entityType: $entityType,
                    field:      '',
                    code:       ErrorCode::IMPORT_EXCEPTION->value,
                    message:    $e->getMessage(),
                );
                $merged->merge($importResult);
            }
        }

        return WriteBackResult::fromImportResult($merged);
    }

    /**
     * Marks the job as 'written_back' and stores any write-back errors.
     */
    public function finalizeJob(string $jobId, WriteBackResult $result, Context $context): void
    {
        $payload = [
            'id'          => $jobId,
            'status'      => JobStatus::WRITTEN_BACK,
            'completedAt' => (new \DateTimeImmutable())->format('Y-m-d H:i:s.v'),
        ];

        if (!empty($result->errors)) {
            $payload['writebackErrors'] = $result->errors;
        }

        $this->jobRepository->update([$payload], $context);
    }

    /**
     * Marks the job as 'writeback_failed' and stores the error message.
     */
    public function failJob(string $jobId, string $errorMessage, Context $context): void
    {
        $this->jobRepository->update([[
            'id'             => $jobId,
            'status'         => JobStatus::WRITEBACK_FAILED,
            'writebackErrors'=> [['code' => ErrorCode::WRITEBACK_FAILED->value, 'message' => $errorMessage]],
        ]], $context);
    }
}
