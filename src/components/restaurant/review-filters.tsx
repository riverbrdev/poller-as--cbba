import Link from "next/link";
import type { ReviewCounts, ReviewFilter } from "@/application/ports/review-repository";
import { cn } from "@/components/lib/utils";
import { REVIEW_TEXT } from "./messages";
import { reviewsHref } from "./review-query";

type ReviewFiltersProps = {
  slug: string;
  active: ReviewFilter;
  counts: ReviewCounts;
  pageSize: number;
};

const chipClass = (active: boolean) =>
  cn(
    "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-bold transition-colors",
    active
      ? "border-brand-dark bg-brand-dark text-white shadow-soft"
      : "border-line bg-white text-ink-muted hover:border-brand-ink hover:text-brand-ink",
  );

/** Chips de filtro como enlaces: funcionan sin JavaScript y se pueden compartir. Cambiar de filtro vuelve a la primera tanda. */
export function ReviewFilters({ slug, active, counts, pageSize }: ReviewFiltersProps) {
  const filters: { filter: ReviewFilter; label: string }[] = [
    { filter: "all", label: REVIEW_TEXT.all(counts.all) },
    { filter: "featured", label: REVIEW_TEXT.featured },
    { filter: "with-comment", label: REVIEW_TEXT.withComment(counts.withComment) },
  ];

  return (
    <nav
      aria-label={REVIEW_TEXT.filtersLabel}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {filters.map(({ filter, label }) => (
        <Link
          key={filter}
          href={reviewsHref(slug, filter, pageSize, pageSize)}
          scroll={false}
          aria-current={filter === active ? "page" : undefined}
          className={chipClass(filter === active)}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
