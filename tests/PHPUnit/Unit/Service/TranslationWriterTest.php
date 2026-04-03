<?php declare(strict_types=1);

namespace Falara\TranslationManager\Tests\PHPUnit\Unit\Service;

use Doctrine\DBAL\Connection;
use Falara\TranslationManager\Core\ContentType\ContentTypeRegistry;
use Falara\TranslationManager\Service\TranslationWriter;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;

class TranslationWriterTest extends TestCase
{
    private Connection&MockObject $connection;
    private TranslationWriter $writer;

    protected function setUp(): void
    {
        $this->connection = $this->createMock(Connection::class);

        $registry      = new ContentTypeRegistry();
        $jobRepository = $this->createMock(EntityRepository::class);

        $this->writer = new TranslationWriter(
            $this->connection,
            $registry,
            $jobRepository,
            new NullLogger(),
        );
    }

    public function testClaimJobReturnsFalseIfAlreadyClaimed(): void
    {
        $this->connection
            ->expects(static::once())
            ->method('executeStatement')
            ->willReturn(0);

        $result = $this->writer->claimJob('00000000000000000000000000000001');

        static::assertFalse($result);
    }

    public function testClaimJobReturnsTrueOnSuccess(): void
    {
        $this->connection
            ->expects(static::once())
            ->method('executeStatement')
            ->willReturn(1);

        $result = $this->writer->claimJob('00000000000000000000000000000001');

        static::assertTrue($result);
    }
}
