import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const catalogPath = resolve("public/data/datasets.json");
const doiPattern = /^10\.\d{4,9}\/\S+$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const supportedArticleTypes = new Set(["Data Descriptor", "Analysis"]);
const supportedDisciplines = new Set([
  "Earth & Environmental Science",
  "Climate",
  "Agriculture",
  "Biology",
  "Medicine & Health",
  "Neuroscience",
  "Chemistry",
  "Physics",
  "Astronomy",
  "Computer Science",
  "Social Science",
  "Urban Science",
  "Ocean Science",
]);
const supportedEvidenceKinds = new Set(["journal", "repository", "supplementary"]);
function fail(message) {
  throw new Error(`Dataset validation failed: ${message}`);
}

function nonEmptyStrings(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function optionalNonEmptyString(value, field, id) {
  if (value !== undefined && (typeof value !== "string" || value.trim().length === 0)) {
    fail(`${id}.${field} must be a non-empty string when provided`);
  }
}

function httpsUrl(value, field, id) {
  if (typeof value !== "string") fail(`${id}.${field} must be a string`);

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    fail(`${id}.${field} is not a valid URL`);
  }

  if (parsed.protocol !== "https:") fail(`${id}.${field} must use HTTPS`);
  return parsed;
}

const payload = JSON.parse(await readFile(catalogPath, "utf8"));
if (!Array.isArray(payload) || payload.length === 0) {
  fail("catalogue must be a non-empty array");
}

const ids = new Set();
const titles = new Set();
const paperDois = new Set();
const datasetDois = new Set();
const currentYear = new Date().getUTCFullYear();

for (const record of payload) {
  if (!record || typeof record !== "object") fail("every entry must be an object");

  const id = typeof record.id === "string" ? record.id : "<missing-id>";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail(`${id}.id must be URL-safe`);
  if (ids.has(id)) fail(`duplicate id: ${id}`);
  ids.add(id);

  if (typeof record.title !== "string" || record.title.trim().length < 8) {
    fail(`${id}.title is missing or too short`);
  }
  if (/^demo:/i.test(record.title)) fail(`${id} is still a demo title`);
  if (titles.has(record.title)) fail(`duplicate title: ${record.title}`);
  titles.add(record.title);

  if (record.demo !== false) fail(`${id}.demo must be false in the production catalogue`);
  if (typeof record.description !== "string" || record.description.trim().length < 40) {
    fail(`${id}.description is missing or too short`);
  }

  for (const field of [
    "authors",
    "disciplines",
    "keywords",
    "variables",
    "formats",
    "provenanceSignals",
  ]) {
    if (!nonEmptyStrings(record[field])) fail(`${id}.${field} must be a non-empty string array`);
  }
  if (!Array.isArray(record.regions) || !record.regions.every((item) => typeof item === "string" && item.trim().length > 0)) {
    fail(`${id}.regions must be a string array`);
  }
  for (const discipline of record.disciplines) {
    if (!supportedDisciplines.has(discipline)) {
      fail(`${id}.disciplines contains an unsupported value: ${discipline}`);
    }
  }
  for (const field of [
    "spatialCoverage",
    "spatialResolution",
    "temporalCoverage",
    "temporalResolution",
    "repository",
    "repositoryTitle",
  ]) {
    optionalNonEmptyString(record[field], field, id);
  }
  for (const field of ["temporalStart", "temporalEnd"]) {
    if (record[field] !== undefined && !Number.isInteger(record[field])) {
      fail(`${id}.${field} must be an integer year when provided`);
    }
  }
  if (
    record.temporalStart !== undefined &&
    record.temporalEnd !== undefined &&
    record.temporalStart > record.temporalEnd
  ) {
    fail(`${id}.temporalStart must not be after temporalEnd`);
  }
  if (
    !Number.isInteger(record.publicationYear) ||
    record.publicationYear < 2014 ||
    record.publicationYear > currentYear
  ) {
    fail(`${id}.publicationYear is outside the Scientific Data publication range`);
  }

  if (record.journal !== "Scientific Data") fail(`${id}.journal must be Scientific Data`);
  if (record.publisher !== "Nature Portfolio") fail(`${id}.publisher must be Nature Portfolio`);
  if (!supportedArticleTypes.has(record.articleType)) {
    fail(`${id}.articleType is not a supported Scientific Data article type`);
  }
  const expectedArticleSignal =
    record.articleType === "Analysis"
      ? "Nature Portfolio Analysis article"
      : "Nature Portfolio Data Descriptor";
  for (const signal of [
    expectedArticleSignal,
    "Open repository",
    "Persistent dataset DOI",
    "License verified",
  ]) {
    if (!record.provenanceSignals.includes(signal)) {
      fail(`${id}.provenanceSignals is missing: ${signal}`);
    }
  }
  if (record.access !== "open") fail(`${id}.access must be open`);
  if (typeof record.license !== "string" || record.license.trim().length < 3) {
    fail(`${id}.license must be stated from the repository record`);
  }

  if (typeof record.paperDoi !== "string" || !doiPattern.test(record.paperDoi)) {
    fail(`${id}.paperDoi is missing or invalid`);
  }
  if (!record.paperDoi.toLowerCase().startsWith("10.1038/s41597-")) {
    fail(`${id}.paperDoi is not a Scientific Data DOI`);
  }
  if (paperDois.has(record.paperDoi.toLowerCase())) fail(`duplicate paper DOI: ${record.paperDoi}`);
  paperDois.add(record.paperDoi.toLowerCase());

  if (typeof record.datasetDoi !== "string" || !doiPattern.test(record.datasetDoi)) {
    fail(`${id}.datasetDoi is missing or invalid`);
  }
  if (datasetDois.has(record.datasetDoi.toLowerCase())) {
    fail(`duplicate dataset DOI: ${record.datasetDoi}`);
  }
  datasetDois.add(record.datasetDoi.toLowerCase());
  for (const field of ["datasetConceptDoi", "datasetVersionDoi"]) {
    if (record[field] !== undefined && !doiPattern.test(record[field])) {
      fail(`${id}.${field} is invalid`);
    }
  }
  if (
    record.repositoryPublicationDate !== undefined &&
    !datePattern.test(record.repositoryPublicationDate)
  ) {
    fail(`${id}.repositoryPublicationDate must use YYYY-MM-DD`);
  }

  const paperUrl = httpsUrl(record.paperUrl, "paperUrl", id);
  const datasetUrl = httpsUrl(record.datasetUrl, "datasetUrl", id);
  if (paperUrl.hostname !== "www.nature.com" || !paperUrl.pathname.startsWith("/articles/")) {
    fail(`${id}.paperUrl must be a Nature article URL`);
  }
  const articleSlug = record.paperDoi.slice(record.paperDoi.indexOf("/") + 1);
  if (paperUrl.pathname !== `/articles/${articleSlug}`) {
    fail(`${id}.paperUrl does not match paperDoi`);
  }
  if (datasetUrl.hostname === "www.nature.com") {
    fail(`${id}.datasetUrl must point to the original data repository`);
  }

  const verification = record.verification;
  if (!verification || verification.status !== "verified") {
    fail(`${id}.verification.status must be verified`);
  }
  if (!datePattern.test(verification.verifiedAt)) {
    fail(`${id}.verification.verifiedAt must use YYYY-MM-DD`);
  }
  const checkedAt = new Date(`${verification.verifiedAt}T00:00:00Z`);
  if (Number.isNaN(checkedAt.valueOf()) || checkedAt > new Date()) {
    fail(`${id}.verification.verifiedAt is invalid or in the future`);
  }
  if (!Array.isArray(verification.evidence) || verification.evidence.length < 2) {
    fail(`${id}.verification.evidence must include journal and repository sources`);
  }

  const journalEvidence = verification.evidence.find((item) => item?.kind === "journal");
  const repositoryEvidence = verification.evidence.find((item) => item?.kind === "repository");
  if (!journalEvidence || !repositoryEvidence) {
    fail(`${id}.verification.evidence is missing a required source kind`);
  }
  for (const evidence of verification.evidence) {
    if (!supportedEvidenceKinds.has(evidence?.kind)) {
      fail(`${id}.verification evidence kind is unsupported`);
    }
    if (typeof evidence.label !== "string" || evidence.label.trim().length === 0) {
      fail(`${id}.verification evidence label is missing`);
    }
    httpsUrl(evidence.url, "verification.evidence.url", id);
  }
  if (journalEvidence.url !== record.paperUrl) {
    fail(`${id} journal evidence must match paperUrl`);
  }
  if (!journalEvidence.label.includes(record.articleType)) {
    fail(`${id} journal evidence label must state articleType`);
  }
  if (repositoryEvidence.url !== record.datasetUrl) {
    fail(`${id} repository evidence must match datasetUrl`);
  }
}

const articleTypeCounts = new Map();
for (const record of payload) {
  articleTypeCounts.set(record.articleType, (articleTypeCounts.get(record.articleType) ?? 0) + 1);
}
const articleTypeSummary = Array.from(articleTypeCounts, ([type, count]) => `${count} ${type}`)
  .sort()
  .join(", ");

console.log(
  `Validated ${payload.length} source-verified Scientific Data records (${articleTypeSummary}; ${datasetDois.size} repository DOIs).`,
);
