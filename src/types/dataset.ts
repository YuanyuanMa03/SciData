export type DatasetAccess = "open" | "restricted" | "registration";

export type DatasetSort = "relevance" | "newest" | "oldest" | "a-z";

export type DatasetVerificationStatus = "verified" | "partial" | "demo";

export type DatasetEvidenceKind = "journal" | "repository" | "supplementary";

export interface DatasetEvidence {
  kind: DatasetEvidenceKind;
  label: string;
  url: string;
}

export interface DatasetVerification {
  status: DatasetVerificationStatus;
  /** ISO 8601 calendar date for the most recent manual source check. */
  verifiedAt: string;
  evidence: DatasetEvidence[];
}

export interface ScientificDataset {
  id: string;
  title: string;
  description: string;

  authors: string[];

  disciplines: string[];
  keywords: string[];

  regions: string[];

  spatialCoverage?: string;
  spatialResolution?: string;

  temporalStart?: number;
  temporalEnd?: number;
  /** Human-readable coverage when a simple year range would lose important meaning. */
  temporalCoverage?: string;
  temporalResolution?: string;

  variables: string[];

  formats: string[];

  publicationYear: number;

  journal?: string;
  publisher?: string;
  articleType?: string;

  paperDoi?: string;
  /** Primary dataset DOI cited by the source article. */
  datasetDoi?: string;
  /** Repository concept DOI, when it differs from the article-cited DOI. */
  datasetConceptDoi?: string;
  /** Current inspected version DOI, when it differs from the article-cited DOI. */
  datasetVersionDoi?: string;

  paperUrl?: string;
  datasetUrl: string;

  repository?: string;
  repositoryTitle?: string;
  repositoryPublicationDate?: string;

  license?: string;

  access: DatasetAccess;

  featured?: boolean;

  /** True when the record is illustrative metadata rather than a verified dataset. */
  demo: boolean;

  verification: DatasetVerification;

  /** Observable source and repository facts, not a scientific quality rating. */
  provenanceSignals: string[];
  verificationNotes?: string[];
}

export interface DatasetFilters {
  disciplines?: readonly string[];
  regions?: readonly string[];
  publicationYearFrom?: number;
  publicationYearTo?: number;
  formats?: readonly string[];
  access?: readonly DatasetAccess[];
}

export interface DatasetQuery {
  query?: string;
  filters?: DatasetFilters;
  sort?: DatasetSort;
}

export interface DatasetSuggestion {
  id: string;
  title: string;
  description: string;
}
