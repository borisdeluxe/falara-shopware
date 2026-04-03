<?php declare(strict_types=1);

namespace Falara\TranslationManager\Service;

enum ErrorCode: string
{
    case ENTITY_DELETED      = 'ENTITY_DELETED';
    case ENTITY_NOT_FOUND    = 'ENTITY_NOT_FOUND';
    case FIELD_WRITE_FAILED  = 'FIELD_WRITE_FAILED';
    case CMS_SLOT_SKIPPED    = 'CMS_SLOT_SKIPPED';
    case UNKNOWN_WRITE_ERROR = 'UNKNOWN_WRITE_ERROR';

    public function message(): string
    {
        return match ($this) {
            self::ENTITY_DELETED      => 'The entity was deleted before translation could be applied.',
            self::ENTITY_NOT_FOUND    => 'The entity could not be found.',
            self::FIELD_WRITE_FAILED  => 'A field could not be updated. Check logs for details.',
            self::CMS_SLOT_SKIPPED    => 'CMS slot was skipped due to unknown or malformed structure.',
            self::UNKNOWN_WRITE_ERROR => 'An unexpected error occurred during write-back. Check logs for details.',
        };
    }
}
