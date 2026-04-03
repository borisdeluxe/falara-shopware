<?php declare(strict_types=1);

namespace Falara\TranslationManager\Service;

class WordCounter
{
    public function count(?string $text): int
    {
        if ($text === null || trim($text) === '') {
            return 0;
        }

        $text = preg_replace(
            '/<\/?(p|div|h[1-6]|br|li|ul|ol|blockquote|tr|td|th|table|section|article|header|footer|nav|aside)\b[^>]*\/?>/i',
            ' ',
            $text,
        );

        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = trim(preg_replace('/\s+/', ' ', $text));

        if ($text === '') {
            return 0;
        }

        return count(explode(' ', $text));
    }

    /** @param string[] $fields */
    public function countFields(array $fields): int
    {
        $total = 0;
        foreach ($fields as $field) {
            $total += $this->count($field);
        }
        return $total;
    }
}
