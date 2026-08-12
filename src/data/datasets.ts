import type {
  DatasetAccess,
  DatasetEvidence,
  DatasetVerification,
  DatasetVerificationStatus,
  ScientificDataset,
} from "../types/dataset";

let datasetsPromise: Promise<readonly ScientificDataset[]> | undefined;

const ACCESS_TYPES = new Set<DatasetAccess>(["open", "restricted", "registration"]);
const VERIFICATION_STATUSES = new Set<DatasetVerificationStatus>([
  "verified",
  "partial",
  "demo",
]);
const EVIDENCE_KINDS = new Set<DatasetEvidence["kind"]>([
  "journal",
  "repository",
  "supplementary",
]);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isEvidence(value: unknown): value is DatasetEvidence {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<DatasetEvidence>;
  return (
    typeof candidate.kind === "string" &&
    EVIDENCE_KINDS.has(candidate.kind as DatasetEvidence["kind"]) &&
    typeof candidate.label === "string" &&
    candidate.label.length > 0 &&
    typeof candidate.url === "string" &&
    candidate.url.startsWith("https://")
  );
}

function isVerification(value: unknown): value is DatasetVerification {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<DatasetVerification>;
  return (
    typeof candidate.status === "string" &&
    VERIFICATION_STATUSES.has(candidate.status as DatasetVerificationStatus) &&
    typeof candidate.verifiedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(candidate.verifiedAt) &&
    Array.isArray(candidate.evidence) &&
    candidate.evidence.every(isEvidence)
  );
}

function isScientificDataset(value: unknown): value is ScientificDataset {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<ScientificDataset>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    isStringArray(candidate.authors) &&
    isStringArray(candidate.disciplines) &&
    isStringArray(candidate.keywords) &&
    isStringArray(candidate.regions) &&
    isStringArray(candidate.variables) &&
    isStringArray(candidate.formats) &&
    isStringArray(candidate.provenanceSignals) &&
    typeof candidate.publicationYear === "number" &&
    Number.isInteger(candidate.publicationYear) &&
    typeof candidate.datasetUrl === "string" &&
    typeof candidate.access === "string" &&
    ACCESS_TYPES.has(candidate.access as DatasetAccess) &&
    typeof candidate.demo === "boolean" &&
    isVerification(candidate.verification)
  );
}

async function fetchDatasets(): Promise<readonly ScientificDataset[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/datasets.json`);

  if (!response.ok) {
    throw new Error(`Unable to load datasets (${response.status} ${response.statusText})`);
  }

  const payload: unknown = await response.json();

  if (!Array.isArray(payload) || !payload.every(isScientificDataset)) {
    throw new Error("Dataset metadata does not match the ScientificDataset schema");
  }

  const ids = new Set<string>();
  for (const dataset of payload) {
    if (ids.has(dataset.id)) {
      throw new Error(`Dataset metadata contains a duplicate id: ${dataset.id}`);
    }
    ids.add(dataset.id);
  }

  return payload;
}

/**
 * Loads the local catalogue. Concurrent callers share one module-level request,
 * including React StrictMode's development-only double effect invocation.
 */
export function loadDatasets(): Promise<readonly ScientificDataset[]> {
  datasetsPromise ??= fetchDatasets().catch((error: unknown) => {
    datasetsPromise = undefined;
    throw error;
  });

  return datasetsPromise;
}
