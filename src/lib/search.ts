import MiniSearch from "minisearch";
import type {
  DatasetFilters,
  DatasetQuery,
  DatasetSort,
  DatasetSuggestion,
  ScientificDataset,
} from "../types/dataset";

const SEARCH_FIELDS = [
  "title",
  "description",
  "keywords",
  "disciplines",
  "regions",
  "variables",
  "authors",
  "journal",
  "repository",
  "publisher",
  "provenanceSignals",
  "temporalCoverage",
] as const;

const FACET_ALIASES: Readonly<Record<string, string>> = {
  "earth-science": "earth-environmental-science",
  earth: "earth-environmental-science",
  environment: "earth-environmental-science",
  medicine: "medicine-health",
  health: "medicine-health",
  ocean: "ocean-science",
  urban: "urban-science",
};

const searchEngineCache = new WeakMap<readonly ScientificDataset[], DatasetSearchEngine>();

function getSearchableField(dataset: ScientificDataset, fieldName: string): string {
  switch (fieldName) {
    case "id":
      return dataset.id;
    case "title":
      return dataset.title;
    case "description":
      return dataset.description;
    case "keywords":
      return dataset.keywords.join(" ");
    case "disciplines":
      return dataset.disciplines.join(" ");
    case "regions":
      return dataset.regions.join(" ");
    case "variables":
      return dataset.variables.join(" ");
    case "authors":
      return dataset.authors.join(" ");
    case "journal":
      return dataset.journal ?? "";
    case "repository":
      return dataset.repository ?? "";
    case "publisher":
      return dataset.publisher ?? "";
    case "provenanceSignals":
      return dataset.provenanceSignals.join(" ");
    case "temporalCoverage":
      return dataset.temporalCoverage ?? "";
    default:
      return "";
  }
}

export function normalizeFacet(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return FACET_ALIASES[slug] ?? slug;
}

function includesSelectedFacet(values: readonly string[], selected: readonly string[]): boolean {
  if (selected.length === 0) return true;

  const normalizedValues = new Set(values.map(normalizeFacet));
  return selected.some((value) => normalizedValues.has(normalizeFacet(value)));
}

export class DatasetSearchEngine {
  readonly datasetCount: number;

  private readonly index: MiniSearch<ScientificDataset>;
  private readonly datasetsById: ReadonlyMap<string, ScientificDataset>;

  constructor(datasets: readonly ScientificDataset[]) {
    this.datasetCount = datasets.length;
    this.datasetsById = new Map(datasets.map((dataset) => [dataset.id, dataset]));
    this.index = new MiniSearch<ScientificDataset>({
      fields: [...SEARCH_FIELDS],
      idField: "id",
      extractField: getSearchableField,
      searchOptions: {
        boost: {
          title: 4,
          keywords: 2.5,
          variables: 2,
          disciplines: 1.5,
          regions: 1.5,
          description: 1,
          authors: 0.5,
          journal: 1,
          repository: 0.75,
          publisher: 0.75,
          provenanceSignals: 0.5,
          temporalCoverage: 0.5,
        },
        combineWith: "AND",
        prefix: true,
        fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
      },
    });
    this.index.addAll([...datasets]);
  }

  search(query: string): ScientificDataset[] {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return [...this.datasetsById.values()];

    return this.index
      .search(normalizedQuery)
      .map((result) => this.datasetsById.get(String(result.id)))
      .filter((dataset): dataset is ScientificDataset => dataset !== undefined);
  }

  suggestions(query: string, limit = 5): DatasetSuggestion[] {
    if (!query.trim() || limit <= 0) return [];

    return this.search(query)
      .slice(0, limit)
      .map(({ id, title, description }) => ({ id, title, description }));
  }
}

export function createDatasetSearchIndex(
  datasets: readonly ScientificDataset[],
): DatasetSearchEngine {
  return new DatasetSearchEngine(datasets);
}

function getCachedSearchEngine(
  datasets: readonly ScientificDataset[],
): DatasetSearchEngine {
  const cached = searchEngineCache.get(datasets);
  if (cached) return cached;

  const engine = createDatasetSearchIndex(datasets);
  searchEngineCache.set(datasets, engine);
  return engine;
}

/** Returns relevance-ordered records. Repeated calls with the same array reuse its index. */
export function searchDatasets(
  datasets: readonly ScientificDataset[],
  query: string,
): ScientificDataset[] {
  return getCachedSearchEngine(datasets).search(query);
}

export function getDatasetSuggestions(
  datasets: readonly ScientificDataset[],
  query: string,
  limit = 5,
): DatasetSuggestion[] {
  return getCachedSearchEngine(datasets).suggestions(query, limit);
}

export function filterDatasets(
  datasets: readonly ScientificDataset[],
  filters: DatasetFilters,
): ScientificDataset[] {
  const {
    disciplines = [],
    regions = [],
    publicationYearFrom,
    publicationYearTo,
    formats = [],
    access = [],
  } = filters;

  return datasets.filter((dataset) => {
    if (!includesSelectedFacet(dataset.disciplines, disciplines)) return false;
    if (!includesSelectedFacet(dataset.regions, regions)) return false;
    if (!includesSelectedFacet(dataset.formats, formats)) return false;
    if (access.length > 0 && !access.includes(dataset.access)) return false;
    if (
      publicationYearFrom !== undefined &&
      dataset.publicationYear < publicationYearFrom
    ) {
      return false;
    }
    if (publicationYearTo !== undefined && dataset.publicationYear > publicationYearTo) {
      return false;
    }

    return true;
  });
}

export function sortDatasets(
  datasets: readonly ScientificDataset[],
  sort: DatasetSort,
): ScientificDataset[] {
  if (sort === "relevance") return [...datasets];

  const sorted = [...datasets];

  sorted.sort((left, right) => {
    if (sort === "newest") {
      return (
        right.publicationYear - left.publicationYear ||
        left.title.localeCompare(right.title, "en", { sensitivity: "base" })
      );
    }
    if (sort === "oldest") {
      return (
        left.publicationYear - right.publicationYear ||
        left.title.localeCompare(right.title, "en", { sensitivity: "base" })
      );
    }

    return left.title.localeCompare(right.title, "en", { sensitivity: "base" });
  });

  return sorted;
}

export function queryDatasets(
  datasets: readonly ScientificDataset[],
  { query = "", filters = {}, sort = "relevance" }: DatasetQuery,
): ScientificDataset[] {
  const searchResults = searchDatasets(datasets, query);
  const filteredResults = filterDatasets(searchResults, filters);
  return sortDatasets(filteredResults, sort);
}

export function countDatasetsByDiscipline(
  datasets: readonly ScientificDataset[],
): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const dataset of datasets) {
    for (const discipline of new Set(dataset.disciplines.map(normalizeFacet))) {
      counts[discipline] = (counts[discipline] ?? 0) + 1;
    }
  }

  return counts;
}
