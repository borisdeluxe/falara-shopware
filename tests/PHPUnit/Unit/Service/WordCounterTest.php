<?php declare(strict_types=1);

namespace Falara\TranslationManager\Tests\PHPUnit\Unit\Service;

use Falara\TranslationManager\Service\WordCounter;
use PHPUnit\Framework\TestCase;

class WordCounterTest extends TestCase
{
    private WordCounter $counter;

    protected function setUp(): void
    {
        $this->counter = new WordCounter();
    }

    public function testCountsPlainText(): void
    {
        static::assertSame(5, $this->counter->count('This is a simple test'));
    }

    public function testCountsHtmlText(): void
    {
        static::assertSame(3, $this->counter->count('<p>Hello <strong>beautiful</strong> world</p>'));
    }

    public function testBlockTagsSplitWords(): void
    {
        static::assertSame(2, $this->counter->count('<strong>word1</strong><em>word2</em>'));
    }

    public function testParagraphsSplitWords(): void
    {
        static::assertSame(2, $this->counter->count('<p>first</p><p>second</p>'));
    }

    public function testBreakTagsSplitWords(): void
    {
        static::assertSame(2, $this->counter->count('word1<br>word2'));
        static::assertSame(2, $this->counter->count('word1<br/>word2'));
        static::assertSame(2, $this->counter->count('word1<br />word2'));
    }

    public function testEmptyStringReturnsZero(): void
    {
        static::assertSame(0, $this->counter->count(''));
    }

    public function testNullReturnsZero(): void
    {
        static::assertSame(0, $this->counter->count(null));
    }

    public function testWhitespaceOnlyReturnsZero(): void
    {
        static::assertSame(0, $this->counter->count('   '));
    }

    public function testMultipleFieldsSum(): void
    {
        static::assertSame(4, $this->counter->countFields(['Hello world', '<p>Two words</p>']));
    }
}
