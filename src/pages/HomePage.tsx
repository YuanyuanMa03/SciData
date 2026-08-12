import { useMemo, useState, type ComponentType } from "react";
import {
  Atom,
  Brain,
  Building2,
  CloudSun,
  Cpu,
  Dna,
  Earth,
  FlaskConical,
  HeartPulse,
  Sprout,
  Telescope,
  UsersRound,
  type LucideProps,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DatasetCard } from "../components/dataset/DatasetCard";
import { SearchBox } from "../components/search/SearchBox";
import { DISCIPLINES } from "../data/disciplines";
import { useDatasets } from "../hooks/useDatasets";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { getMessages } from "../i18n/messages";

const copy = getMessages();
const popularSearches = [...copy.home.popularSearches];

const disciplineIcons: Record<string, ComponentType<LucideProps>> = {
  "earth-environmental-science": Earth,
  climate: CloudSun,
  agriculture: Sprout,
  biology: Dna,
  "medicine-health": HeartPulse,
  neuroscience: Brain,
  chemistry: FlaskConical,
  physics: Atom,
  astronomy: Telescope,
  "computer-science": Cpu,
  "social-science": UsersRound,
  "urban-science": Building2,
};

export function HomePage() {
  const navigate = useNavigate();
  const { datasets, loading, error } = useDatasets();
  const [query, setQuery] = useState("");

  useDocumentMeta({
    title: "SciData — Discover scientific datasets",
    description: "Discover scientific datasets across disciplines.",
  });

  const featuredDatasets = useMemo(
    () => datasets.filter((dataset) => dataset.featured).slice(0, 4),
    [datasets],
  );

  const datasetCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const dataset of datasets) {
      for (const discipline of dataset.disciplines) {
        counts.set(discipline, (counts.get(discipline) ?? 0) + 1);
      }
    }

    return counts;
  }, [datasets]);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return popularSearches;
    }

    const matchingTerms = datasets.flatMap((dataset) => [
      dataset.title,
      ...dataset.keywords,
      ...dataset.variables,
    ]);

    return Array.from(
      new Set(
        matchingTerms.filter((term) =>
          term.toLocaleLowerCase().includes(normalizedQuery),
        ),
      ),
    ).slice(0, 6);
  }, [datasets, query]);

  const submitSearch = (nextQuery = query) => {
    const trimmed = nextQuery.trim();
    navigate(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : "/explore");
  };

  return (
    <main>
      <section className="border-b border-border">
        <div className="content-container flex min-h-[440px] flex-col items-center justify-center py-14 text-center md:min-h-[355px] md:py-10">
          <h1 className="text-balance max-w-5xl text-[2.65rem] leading-[1.06] font-bold tracking-[-0.045em] text-foreground sm:text-[3.5rem]">
            {copy.home.title}
          </h1>
          <p className="text-balance mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg md:text-xl md:leading-8">
            {copy.home.description}
          </p>

          <div className="mt-5 w-full max-w-4xl">
            <SearchBox
              value={query}
              onValueChange={setQuery}
              onSubmit={submitSearch}
              suggestions={suggestions}
              placeholder={copy.home.searchPlaceholder}
            />
          </div>

          <div className="mt-3 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm">
            <span className="mr-1 text-muted">{copy.home.popularLabel}</span>
            {popularSearches.map((search) => (
              <button
                key={search}
                type="button"
                className="min-h-9 rounded-md border border-border px-3.5 text-[13px] font-medium text-accent transition-colors hover:border-accent/40 hover:bg-accent-soft focus-visible:outline-offset-2"
                onClick={() => submitSearch(search)}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border py-7 md:py-6">
        <div className="page-container">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-[-0.025em] md:text-3xl">
              {copy.home.disciplinesTitle}
            </h2>
            <Link
              to="/disciplines"
              className="shrink-0 text-sm font-medium text-accent hover:underline"
            >
              {copy.home.viewAll}
            </Link>
          </div>

          <div className="grid grid-cols-2 border-t border-l border-border sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-12">
            {DISCIPLINES.slice(0, 12).map((discipline) => {
              const Icon = disciplineIcons[discipline.slug] ?? Earth;
              const count = datasetCounts.get(discipline.name) ?? 0;

              return (
                <Link
                  key={discipline.slug}
                  to={`/explore?discipline=${encodeURIComponent(discipline.slug)}`}
                  aria-label={`${discipline.name}, ${count} ${count === 1 ? "dataset" : "datasets"}`}
                  className="group min-h-28 border-r border-b border-border p-3 transition-colors hover:bg-surface"
                >
                  <Icon
                    aria-hidden="true"
                    className="h-7 w-7 text-accent"
                    strokeWidth={1.5}
                  />
                  <h3 className="mt-3 text-sm leading-5 font-semibold group-hover:text-accent">
                    {"shortName" in discipline ? discipline.shortName : discipline.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    {loading
                      ? "Loading…"
                      : `${count} ${count === 1 ? "dataset" : "datasets"}`}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="page-container">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-[-0.025em] md:text-3xl">
              {copy.home.featuredTitle}
            </h2>
            <Link
              to="/explore"
              className="shrink-0 text-sm font-medium text-accent hover:underline"
            >
              {copy.home.viewAll}
            </Link>
          </div>

          {error ? (
            <div
              role="alert"
              className="border border-warning/30 bg-orange-50 px-5 py-4 text-sm text-warning"
            >
              Dataset metadata could not be loaded. Please refresh the page.
            </div>
          ) : loading ? (
            <div className="divide-y divide-border border-y border-border" aria-busy="true">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-36 animate-pulse bg-surface/70" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border border-y border-border">
              {featuredDatasets.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} variant="featured" />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
