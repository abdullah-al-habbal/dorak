<?php

declare(strict_types=1);

namespace Modules\Marketing\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\Marketing\Constants\MarketingPageConstants;
use Modules\Marketing\Models\MarketingPageModel;
use Modules\Marketing\Models\SectionModel;

/** Moves a page between draft and published, refuses an incomplete page, and records who did it. */
final class MarketingPagePublisher
{
    public function __construct(
        private readonly StatusChangeLogger $logger,
    ) {}

    public function set(MarketingPageModel $page, bool $published, string $adminId): MarketingPageModel
    {
        if ($published && ! $this->isComplete($page)) {
            throw ValidationException::withMessages(['published' => [__('marketing::marketing.page_incomplete')]]);
        }

        return DB::transaction(function () use ($page, $published, $adminId): MarketingPageModel {
            $locked = MarketingPageModel::query()->whereKey($page->getKey())->lockForUpdate()->firstOrFail();
            $from = $locked->isPublished() ? MarketingPageConstants::MARKETING_PAGE_STATE_PUBLISHED : MarketingPageConstants::MARKETING_PAGE_STATE_DRAFT;
            $to = $published ? MarketingPageConstants::MARKETING_PAGE_STATE_PUBLISHED : MarketingPageConstants::MARKETING_PAGE_STATE_DRAFT;

            if ($from === $to) {
                return $locked;
            }

            $locked->update(['published_at' => $published ? now() : null]);
            $this->logger->log(StatusChangeSubjectTypeEnum::MarketingPage, (string) $locked->getKey(), $from, $to, StatusChangeActorTypeEnum::Admin, $adminId);

            return $locked->refresh();
        });
    }

    /** Both titles are set and every section has text in both languages, so no visitor sees a half-translated page. */
    private function isComplete(MarketingPageModel $page): bool
    {
        foreach (['en', 'ar'] as $locale) {
            if (trim((string) $page->getTranslation('title', $locale, false)) === '') {
                return false;
            }
        }

        $sections = $page->sections()->get();
        if ($sections->isEmpty()) {
            return false;
        }

        return $sections->every(fn (SectionModel $section): bool => $this->hasBody($section, 'en') && $this->hasBody($section, 'ar'));
    }

    private function hasBody(SectionModel $section, string $locale): bool
    {
        $body = $section->getTranslation('body', $locale, false);

        return is_array($body) && $body !== [];
    }
}
