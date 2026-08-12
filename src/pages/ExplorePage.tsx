import { useDeferredValue, useMemo } from "react";
import { SearchX } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { DatasetCard } from "../components/dataset/DatasetCard";
import { FilterSheet } from "../components/filters/FilterSheet";
import {
  FiltersPanel,
  type FilterGroup,
  type FilterOptions,
  type FilterState,
  type YearBound,
} from "../components/filters/FiltersPanel";
import { SearchBox } from "../components/search/SearchBox";
import { Button } from "../components/ui/button";
import { DISCIPLINES } from "../data/disciplines";
import { useDatasets } from "../hooks/useDatasets";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { getMessages } from "../i18n/messages";
import {
  getDatasetSuggestions,
  normalizeFacet,
  queryDatasets,
} from "../lib/search";
import type { DatasetAccess, DatasetSort } from "../types/dataset";

const PRIORITY_REGIONS = [
  ["global", "Global"],
  ["china", "China"],
  ["asia", "Asia"],
  ["europe", "Europe"],
  ["north-america", "North America"],
  ["africa", "Africa"],
] as const;

const PRIORITY_FORMATS = [
  "CSV",
  "JSON",
  "NetCDF",
  "GeoTIFF",
  "HDF5",
  "Images",
  "GeoPackage",
  "Parquet",
  "Shapefile",
  "XLSX",
  "FASTQ",
  "FASTA",
  "VCF",
  "DICOM",
  "FITS",
  "Other",
] as const;

const ACCESS_OPTIONS: ReadonlyArray<{ value: DatasetAccess; label: string }> = [
  { value: "open", label: "Open" },
  { value: "restricted", label: "Restricted" },
  { value: "registration", label: "Registration Required" },
];

const SORT_OPTIONS: ReadonlyArray<{ value: DatasetSort; label: string }> = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "a-z", label: "A–Z" },
];

const FILTER_PARAM_BY_GROUP: Record<FilterGroup, string> = {
  disciplines: "discipline",
  regions: "region",
  formats: "format",
  access: "access",
};

const copy = getMessages();

function getMultiValue(searchParams: URLSearchParams, key: string) {
  return searchParams
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

function getYear(searchParams: URLSearchParams, key: string) {
  const raw = searchParams.get(key);
  if (!raw) return undefined;

  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function getSort(searchParams: URLSearchParams): DatasetSort {
  const value = searchParams.get("sort");
  return SORT_OPTIONS.some((option) => option.value === value)
    ? (value as DatasetSort)
    : "relevance";
}

function isDatasetAccess(value: string): value is DatasetAccess {
  return ACCESS_OPTIONS.some((option) => option.value === value);
}

export function ExplorePage() {
  const { datasets, loading, error } = useDatasets();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const deferredQuery = useDeferredValue(query);
  const sort = getSort(searchParams);

  useDocumentMeta({
    title: query ? `${query} datasets | SciData` : "Explore datasets | SciData",
    description: query
      ? `Search SciData's source-verified catalogue for ${query}.`
      : "Search and filter source-verified scientific dataset metadata across disciplines.",
  });

  const filters = useMemo<FilterState>(
    () => ({
      disciplines: getMultiValue(searchParams, "discipline"),
      regions: getMultiValue(searchParams, "region"),
      formats: getMultiValue(searchParams, "format"),
      access: getMultiValue(searchParams, "access"),
      yearFrom: getYear(searchParams, "yearFrom"),
      yearTo: getYear(searchParams, "yearTo"),
    }),
    [searchParams],
  );

  const filterOptions = useMemo<FilterOptions>(() => {
    const countFacet = (
      values: (typeof datasets)[number]["disciplines"],
      option: string,
    ) => values.some((value) => normalizeFacet(value) === normalizeFacet(option));

    return {
      disciplines: DISCIPLINES.map((discipline) => ({
        value: discipline.slug,
        label: discipline.name,
        count: datasets.filter((dataset) =>
          countFacet(dataset.disciplines, discipline.slug),
        ).length,
      })),
      regions: (() => {
        const labels = new Map<string, string>(PRIORITY_REGIONS);
        for (const dataset of datasets) {
          for (const region of dataset.regions) {
            labels.set(normalizeFacet(region), region);
          }
        }

        return Array.from(labels, ([value, label]) => ({
          value,
          label,
          count: datasets.filter((dataset) => countFacet(dataset.regions, value)).length,
        })).sort((left, right) => {
          const leftPriority = PRIORITY_REGIONS.findIndex(([value]) => value === left.value);
          const rightPriority = PRIORITY_REGIONS.findIndex(([value]) => value === right.value);
          if (leftPriority >= 0 || rightPriority >= 0) {
            return (
              (leftPriority >= 0 ? leftPriority : Number.MAX_SAFE_INTEGER) -
              (rightPriority >= 0 ? rightPriority : Number.MAX_SAFE_INTEGER)
            );
          }
          return left.label.localeCompare(right.label);
        });
      })(),
      formats: (() => {
        const formats = new Set<string>(PRIORITY_FORMATS);
        datasets.forEach((dataset) => dataset.formats.forEach((format) => formats.add(format)));

        return Array.from(formats)
          .map((format) => ({
            value: format,
            label: format,
            count: datasets.filter((dataset) => countFacet(dataset.formats, format)).length,
          }))
          .sort((left, right) => {
            const leftPriority = PRIORITY_FORMATS.indexOf(
              left.value as (typeof PRIORITY_FORMATS)[number],
            );
            const rightPriority = PRIORITY_FORMATS.indexOf(
              right.value as (typeof PRIORITY_FORMATS)[number],
            );
            if (leftPriority >= 0 || rightPriority >= 0) {
              return (
                (leftPriority >= 0 ? leftPriority : Number.MAX_SAFE_INTEGER) -
                (rightPriority >= 0 ? rightPriority : Number.MAX_SAFE_INTEGER)
              );
            }
            return left.label.localeCompare(right.label);
          });
      })(),
      access: ACCESS_OPTIONS.map((option) => ({
        ...option,
        count: datasets.filter((dataset) => dataset.access === option.value).length,
      })),
    };
  }, [datasets]);

  const results = useMemo(
    () =>
      queryDatasets(datasets, {
        query: deferredQuery,
        filters: {
          disciplines: filters.disciplines,
          regions: filters.regions,
          formats: filters.formats,
          access: filters.access.filter(isDatasetAccess),
          publicationYearFrom: filters.yearFrom,
          publicationYearTo: filters.yearTo,
        },
        sort,
      }),
    [datasets, deferredQuery, filters, sort],
  );

  const suggestions = useMemo(
    () => getDatasetSuggestions(datasets, query, 6).map((suggestion) => suggestion.title),
    [datasets, query],
  );

  const activeFilterCount =
    filters.disciplines.length +
    filters.regions.length +
    filters.formats.length +
    filters.access.length +
    Number(filters.yearFrom !== undefined) +
    Number(filters.yearTo !== undefined);

  const updateParams = (
    mutate: (nextParams: URLSearchParams) => void,
    replace = true,
  ) => {
    const nextParams = new URLSearchParams(searchParams);
    mutate(nextParams);
    setSearchParams(nextParams, { replace });
  };

  const updateQuery = (nextQuery: string, replace = true) => {
    updateParams((nextParams) => {
      if (nextQuery.trim()) {
        nextParams.set("q", nextQuery);
      } else {
        nextParams.delete("q");
      }
    }, replace);
  };

  const toggleFilter = (group: FilterGroup, value: string) => {
    const key = FILTER_PARAM_BY_GROUP[group];
    updateParams((nextParams) => {
      const currentValues = getMultiValue(nextParams, key);
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((current) => current !== value)
        : [...currentValues, value];

      nextParams.delete(key);
      nextValues.forEach((nextValue) => nextParams.append(key, nextValue));
    });
  };

  const updateYear = (bound: YearBound, value: number | undefined) => {
    const key = bound === "from" ? "yearFrom" : "yearTo";
    updateParams((nextParams) => {
      if (value === undefined) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });
  };

  const clearFilters = () => {
    updateParams((nextParams) => {
      ["discipline", "region", "format", "access", "yearFrom", "yearTo"].forEach(
        (key) => nextParams.delete(key),
      );
    });
  };

  const filterProps = {
    filters,
    options: filterOptions,
    onToggle: toggleFilter,
    onYearChange: updateYear,
    onClear: clearFilters,
  };

  return (
    <main className="page-container py-8 md:py-10">
      <div className="border-b border-border pb-7">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {copy.explore.title}
        </h1>
        <div className="mt-5 max-w-3xl">
          <SearchBox
            value={query}
            onValueChange={(value) => updateQuery(value)}
            onSubmit={(value) => updateQuery(value, false)}
            suggestions={suggestions}
            placeholder={copy.explore.searchPlaceholder}
            compact
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <div className="hidden border-r border-border pr-6 lg:block xl:pr-8">
          <div className="sticky top-[calc(var(--header-height)+1rem)] max-h-[calc(100dvh-var(--header-height)-2rem)] overflow-y-auto pb-8 pr-1 scrollbar-subtle">
            <FiltersPanel {...filterProps} />
          </div>
        </div>

        <section className="min-w-0 pt-6" aria-labelledby="result-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <FilterSheet {...filterProps} resultCount={results.length} />
              </div>
              <p
                id="result-heading"
                className="text-sm font-medium text-foreground"
                role="status"
                aria-live="polite"
              >
                {loading
                  ? "Loading datasets…"
                  : `${results.length.toLocaleString()} ${results.length === 1 ? "dataset" : "datasets"}`}
                {query ? <span className="text-muted"> for “{query}”</span> : null}
              </p>
              {activeFilterCount > 0 ? (
                <span className="hidden text-xs text-muted sm:inline">
                  {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"}
                </span>
              ) : null}
            </div>

            <label className="flex min-h-11 items-center gap-2 text-xs font-medium text-muted">
              <span>{copy.explore.sortLabel}</span>
              <select
                value={sort}
                onChange={(event) => {
                  const nextSort = event.target.value as DatasetSort;
                  updateParams((nextParams) => {
                    if (nextSort === "relevance") {
                      nextParams.delete("sort");
                    } else {
                      nextParams.set("sort", nextSort);
                    }
                  });
                }}
                className="min-h-10 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:border-accent"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="hidden grid-cols-[3rem_minmax(16rem,2.7fr)_minmax(7rem,1fr)_minmax(6rem,0.9fr)_4.5rem_minmax(7rem,1fr)_minmax(5rem,0.7fr)_minmax(6rem,0.8fr)_auto] items-center gap-3 border-b border-border px-4 py-3 text-[11px] font-medium tracking-wide text-muted uppercase xl:grid">
            <span aria-hidden="true" />
            <span>Dataset</span>
            <span>Discipline</span>
            <span>Region</span>
            <span>Year</span>
            <span>Temporal coverage</span>
            <span>Format</span>
            <span>Access</span>
            <span className="text-right">Record</span>
          </div>

          {error ? (
            <div role="alert" className="mt-8 border-l-2 border-warning pl-5">
              <h2 className="font-semibold text-warning">Dataset catalogue unavailable</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                The local JSON file could not be loaded. Refresh the page or check the
                deployment base path.
              </p>
            </div>
          ) : loading ? (
            <div className="divide-y divide-border" aria-busy="true">
              {[0, 1, 2, 3, 4].map((item) => (
                <div key={item} className="h-28 animate-pulse bg-surface/60" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3 pt-4 xl:space-y-0 xl:pt-0">
              {results.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} variant="result" />
              ))}
            </div>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center border-b border-border px-5 py-16 text-center">
              <SearchX aria-hidden="true" className="size-8 text-accent" strokeWidth={1.5} />
              <h2 className="mt-5 text-xl font-semibold">No datasets match this search</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                Try a broader keyword or remove one of the active filters.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {activeFilterCount > 0 ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : null}
                {query ? (
                  <Button onClick={() => updateQuery("", false)}>Browse all datasets</Button>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
