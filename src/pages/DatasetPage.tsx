import * as Dialog from "@radix-ui/react-dialog";
import {
  BadgeCheck,
  Calendar,
  Check,
  ChevronLeft,
  CircleAlert,
  Clock,
  Copy,
  ExternalLink,
  File,
  Globe,
  Layers,
  Lock,
  Quote,
  Unlock,
  Users,
  X,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DISCIPLINES } from "../data/disciplines";
import { useDatasets } from "../hooks/useDatasets";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import type { ScientificDataset } from "../types/dataset";

const SECTION_LINKS = [
  ["overview", "Overview"],
  ["variables", "Variables"],
  ["spatial-coverage", "Spatial Coverage"],
  ["temporal-coverage", "Temporal Coverage"],
  ["files-formats", "Files & Formats"],
  ["source-citation", "Source & Citation"],
  ["license-access", "License & Access"],
] as const;

const ACCESS_LABELS: Record<ScientificDataset["access"], string> = {
  open: "Open",
  restricted: "Restricted",
  registration: "Registration required",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function disciplineSlug(value: string) {
  const normalized = slugify(value).replace(/-and-/g, "-");
  const definition = DISCIPLINES.find((discipline) => {
    const aliases = [
      discipline.name,
      "shortName" in discipline ? discipline.shortName : undefined,
      discipline.slug,
    ];

    return aliases.some(
      (alias) => alias && slugify(alias).replace(/-and-/g, "-") === normalized,
    );
  });

  return definition?.slug ?? slugify(value);
}

function temporalCoverage(dataset: ScientificDataset) {
  if (dataset.temporalCoverage) {
    return dataset.temporalCoverage;
  }

  if (dataset.temporalStart && dataset.temporalEnd) {
    return dataset.temporalStart === dataset.temporalEnd
      ? String(dataset.temporalStart)
      : `${dataset.temporalStart}–${dataset.temporalEnd}`;
  }

  if (dataset.temporalStart) {
    return `From ${dataset.temporalStart}`;
  }

  if (dataset.temporalEnd) {
    return `Until ${dataset.temporalEnd}`;
  }

  return "Not provided";
}

function normalizeDoi(doi: string) {
  return doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").trim();
}

function doiUrl(doi: string) {
  return `https://doi.org/${encodeURI(normalizeDoi(doi))}`;
}

function createCitation(dataset: ScientificDataset) {
  const authors = dataset.authors.length
    ? dataset.authors.join(", ")
    : "Authors not provided";
  const kind = dataset.demo ? "Demo dataset metadata" : "Dataset";
  const repository = dataset.repository ? ` ${dataset.repository}.` : "";
  const doi = dataset.datasetDoi
    ? ` ${doiUrl(dataset.datasetDoi)}`
    : "";

  return `${authors} (${dataset.publicationYear}). ${dataset.title} [${kind}].${repository}${doi}`;
}

function MetadataRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
      <dt className="text-[13px] font-medium text-muted">{label}</dt>
      <dd className="min-w-0 text-sm leading-6 text-foreground">{children}</dd>
    </div>
  );
}

function MissingValue() {
  return <span className="text-muted">Not provided</span>;
}

function ExternalValue({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) {
    return <MissingValue />;
  }

  return (
    <a
      className="inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 hover:underline"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
      <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
    </a>
  );
}

function QuickFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-accent" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-sm leading-5">{value}</dd>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="scroll-mt-28 border-t border-border py-6" id={id}>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 text-[15px] leading-7 text-muted">{children}</div>
    </section>
  );
}

function LoadingState() {
  return (
    <main className="content-container py-14" aria-busy="true" aria-live="polite">
      <div className="h-5 w-28 animate-pulse rounded bg-surface" />
      <div className="mt-8 h-12 max-w-3xl animate-pulse rounded bg-surface" />
      <div className="mt-4 h-6 max-w-2xl animate-pulse rounded bg-surface" />
      <p className="sr-only">Loading dataset</p>
    </main>
  );
}

export function DatasetPage() {
  const { id } = useParams<{ id: string }>();
  const { datasets, loading, error } = useDatasets();
  const [citationOpen, setCitationOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copied" | "unavailable"
  >("idle");
  const dataset = useMemo(
    () => datasets.find((item) => item.id === id),
    [datasets, id],
  );

  const pageTitle = dataset
    ? `${dataset.title} | SciData`
    : loading
      ? "Loading dataset | SciData"
      : "Dataset not found | SciData";
  const pageDescription = dataset?.description ??
    "Browse scientific dataset metadata on SciData.";

  useDocumentMeta({
    title: pageTitle,
    description: pageDescription,
    type: dataset ? "article" : "website",
  });

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    const message = error instanceof Error ? error.message : undefined;

    return (
      <main className="content-container py-16">
        <div className="max-w-2xl border-l-2 border-warning pl-5">
          <p className="text-sm font-semibold text-warning">Dataset unavailable</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            We could not load the dataset catalogue.
          </h1>
          <p className="mt-4 text-muted">
            {message ?? "The local dataset file could not be read."}
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm font-medium hover:border-accent hover:text-accent"
            to="/explore"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            Back to Explore
          </Link>
        </div>
      </main>
    );
  }

  if (!dataset) {
    return (
      <main className="content-container py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-sm text-accent">404 / DATASET</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Dataset not found
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            No dataset in the local catalogue matches this URL. It may have been
            renamed or removed.
          </p>
          <Link
            className="mt-7 inline-flex min-h-11 items-center gap-2 bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover"
            to="/explore"
          >
            Browse datasets
          </Link>
        </div>
      </main>
    );
  }

  const coverage = temporalCoverage(dataset);
  const spatialCoverage =
    dataset.spatialCoverage ?? (dataset.regions.join(", ") || "Not provided");
  const citation = createCitation(dataset);
  const primaryDiscipline = dataset.disciplines[0] ?? "Not provided";
  const accessLabel = ACCESS_LABELS[dataset.access];
  const datasetDoi = dataset.datasetDoi
    ? normalizeDoi(dataset.datasetDoi)
    : undefined;
  const paperDoi = dataset.paperDoi
    ? normalizeDoi(dataset.paperDoi)
    : undefined;

  async function copy(value: string) {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(value);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1800);
    } catch {
      setCopyStatus("unavailable");
    }
  }

  return (
    <main className="content-container py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium text-accent hover:underline" to="/explore">
              Explore
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Dataset</li>
        </ol>
      </nav>

      <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1fr)_230px] lg:items-start">
        <div>
          <h1 className="max-w-5xl text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
            {dataset.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            {dataset.description}
          </p>

          {dataset.demo ? (
            <div className="mt-5 inline-flex items-center gap-2 border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-medium text-warning">
              <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
              Demo metadata — not a verified scientific record
            </div>
          ) : dataset.verification.status === "verified" ? (
            <div className="mt-5 inline-flex items-center gap-2 border border-success/25 bg-green-50 px-3 py-2 text-sm font-medium text-success">
              <BadgeCheck aria-hidden="true" className="size-4 shrink-0" />
              Source verified against the journal article and original repository
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Dataset tags">
            {dataset.disciplines.map((discipline) => (
              <Link
                className="border border-accent/30 px-3 py-1 text-xs font-medium text-accent hover:border-accent hover:bg-accent-soft"
                key={`discipline-${discipline}`}
                to={`/explore?discipline=${encodeURIComponent(disciplineSlug(discipline))}`}
              >
                {discipline}
              </Link>
            ))}
            {dataset.regions.map((region) => (
              <Link
                className="border border-border px-3 py-1 text-xs font-medium text-muted hover:border-accent hover:text-accent"
                key={`region-${region}`}
                to={`/explore?region=${encodeURIComponent(slugify(region))}`}
              >
                {region}
              </Link>
            ))}
            {dataset.keywords.slice(0, 3).map((keyword) => (
              <Link
                className="border border-border px-3 py-1 text-xs font-medium text-muted hover:border-accent hover:text-accent"
                key={`keyword-${keyword}`}
                to={`/explore?q=${encodeURIComponent(keyword)}`}
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {dataset.datasetUrl ? (
            <a
              className="inline-flex min-h-11 items-center justify-center gap-2 bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover"
              href={dataset.datasetUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              View Dataset
            </a>
          ) : (
            <button
              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 border border-border bg-surface px-4 text-sm font-medium text-muted"
              disabled
              title="Dataset URL not provided"
              type="button"
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              View Dataset · Not provided
            </button>
          )}

          {dataset.paperUrl ? (
            <a
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-accent px-4 text-sm font-semibold text-accent hover:bg-accent-soft"
              href={dataset.paperUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              View Paper
            </a>
          ) : (
            <button
              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 border border-border bg-surface px-4 text-sm font-medium text-muted"
              disabled
              title="Paper URL not provided"
              type="button"
            >
              View Paper · Not provided
            </button>
          )}

          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-accent px-4 text-sm font-semibold text-accent enabled:hover:bg-accent-soft disabled:cursor-not-allowed disabled:border-border disabled:bg-surface disabled:text-muted"
            disabled={!datasetDoi}
            onClick={() => datasetDoi && void copy(datasetDoi)}
            title={datasetDoi ? "Copy dataset DOI" : "Dataset DOI not provided"}
            type="button"
          >
            {copyStatus === "copied" ? (
              <Check aria-hidden="true" className="size-4" />
            ) : (
              <Copy aria-hidden="true" className="size-4" />
            )}
            {datasetDoi ? "Copy DOI" : "DOI · Not provided"}
          </button>

          <Dialog.Root
            open={citationOpen}
            onOpenChange={(open) => {
              setCitationOpen(open);
              setCopyStatus("idle");
            }}
          >
            <Dialog.Trigger asChild>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-accent px-4 text-sm font-semibold text-accent hover:bg-accent-soft"
                type="button"
              >
                <Quote aria-hidden="true" className="size-4" />
                Cite
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/35" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%_-_2rem)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 border border-border bg-white p-6 shadow-2xl sm:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <Dialog.Title className="text-2xl font-semibold tracking-tight">
                      Cite this dataset
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm leading-6 text-muted">
                      Simple metadata citation. Check the original repository for
                      its preferred citation before publication.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      aria-label="Close citation dialog"
                      className="-mr-2 -mt-2 inline-flex size-11 shrink-0 items-center justify-center text-muted hover:bg-surface hover:text-foreground"
                      type="button"
                    >
                      <X aria-hidden="true" className="size-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="mt-6 border border-border bg-surface p-4 font-mono text-sm leading-6 text-foreground">
                  {citation}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    className="inline-flex min-h-11 items-center gap-2 bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover"
                    onClick={() => void copy(citation)}
                    type="button"
                  >
                    {copyStatus === "copied" ? (
                      <Check aria-hidden="true" className="size-4" />
                    ) : (
                      <Copy aria-hidden="true" className="size-4" />
                    )}
                    {copyStatus === "copied" ? "Copied" : "Copy citation"}
                  </button>
                  {copyStatus === "unavailable" ? (
                    <p className="text-sm text-warning" role="status">
                      Clipboard unavailable. Select the citation text to copy it.
                    </p>
                  ) : null}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[160px_minmax(0,1fr)_250px] xl:grid-cols-[170px_minmax(0,1fr)_280px]">
        <nav
          aria-label="Dataset sections"
          className="hidden self-start border-l border-border lg:sticky lg:top-24 lg:block"
        >
          {SECTION_LINKS.map(([href, label], index) => (
            <a
              className={`block border-l-2 py-2.5 pl-4 text-sm transition-colors hover:border-accent hover:text-accent ${
                index === 0
                  ? "-ml-px border-accent font-medium text-accent"
                  : "-ml-px border-transparent text-muted"
              }`}
              href={`#${href}`}
              key={href}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="min-w-0">
          <section className="scroll-mt-28 pb-6" id="overview">
            <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
            <dl className="mt-2">
              <MetadataRow label="Dataset title">{dataset.title}</MetadataRow>
              <MetadataRow label="Description">{dataset.description}</MetadataRow>
              <MetadataRow label="Authors">
                {dataset.authors.length ? dataset.authors.join(", ") : <MissingValue />}
              </MetadataRow>
              <MetadataRow label="Publication year">
                {dataset.publicationYear}
              </MetadataRow>
              <MetadataRow label="Journal">
                {dataset.journal ?? <MissingValue />}
              </MetadataRow>
              <MetadataRow label="Publisher">
                {dataset.publisher ?? <MissingValue />}
              </MetadataRow>
              <MetadataRow label="Article type">
                {dataset.articleType ?? <MissingValue />}
              </MetadataRow>
              <MetadataRow label="Paper DOI">
                {paperDoi ? (
                  <ExternalValue href={doiUrl(paperDoi)}>{paperDoi}</ExternalValue>
                ) : (
                  <MissingValue />
                )}
              </MetadataRow>
              <MetadataRow label="Article-cited dataset DOI">
                {datasetDoi ? (
                  <ExternalValue href={doiUrl(datasetDoi)}>{datasetDoi}</ExternalValue>
                ) : (
                  <MissingValue />
                )}
              </MetadataRow>
              {dataset.datasetConceptDoi ? (
                <MetadataRow label="Concept DOI">
                  <ExternalValue href={doiUrl(dataset.datasetConceptDoi)}>
                    {normalizeDoi(dataset.datasetConceptDoi)}
                  </ExternalValue>
                </MetadataRow>
              ) : null}
              {dataset.datasetVersionDoi ? (
                <MetadataRow label="Current version DOI">
                  <ExternalValue href={doiUrl(dataset.datasetVersionDoi)}>
                    {normalizeDoi(dataset.datasetVersionDoi)}
                  </ExternalValue>
                </MetadataRow>
              ) : null}
              <MetadataRow label="Repository">
                {dataset.repository ? (
                  dataset.datasetUrl ? (
                    <ExternalValue href={dataset.datasetUrl}>
                      {dataset.repository}
                    </ExternalValue>
                  ) : (
                    dataset.repository
                  )
                ) : (
                  <MissingValue />
                )}
              </MetadataRow>
              {dataset.repositoryPublicationDate ? (
                <MetadataRow label="Repository publication date">
                  {dataset.repositoryPublicationDate}
                </MetadataRow>
              ) : null}
              <MetadataRow label="Spatial coverage">
                {spatialCoverage === "Not provided" ? <MissingValue /> : spatialCoverage}
              </MetadataRow>
              <MetadataRow label="Temporal coverage">{coverage}</MetadataRow>
              <MetadataRow label="Spatial resolution">
                {dataset.spatialResolution ?? <MissingValue />}
              </MetadataRow>
              <MetadataRow label="Temporal resolution">
                {dataset.temporalResolution ?? <MissingValue />}
              </MetadataRow>
              <MetadataRow label="Variables">
                {dataset.variables.length ? dataset.variables.join(", ") : <MissingValue />}
              </MetadataRow>
              <MetadataRow label="Formats">
                {dataset.formats.length ? dataset.formats.join(", ") : <MissingValue />}
              </MetadataRow>
              <MetadataRow label="License">
                {dataset.license ?? <MissingValue />}
              </MetadataRow>
              <MetadataRow label="Access type">{accessLabel}</MetadataRow>
              <MetadataRow label="Metadata verified">
                {dataset.verification.verifiedAt}
              </MetadataRow>
              <MetadataRow label="Provenance signals">
                {dataset.provenanceSignals.join(", ")}
              </MetadataRow>
            </dl>
          </section>

          <Section id="variables" title="Variables">
            {dataset.variables.length ? (
              <ul className="flex flex-wrap gap-2" aria-label="Variables">
                {dataset.variables.map((variable) => (
                  <li className="border border-border bg-surface px-3 py-1 text-sm text-foreground" key={variable}>
                    {variable}
                  </li>
                ))}
              </ul>
            ) : (
              <MissingValue />
            )}
          </Section>

          <Section id="spatial-coverage" title="Spatial Coverage">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
                  Coverage
                </dt>
                <dd className="mt-1 text-foreground">
                  {spatialCoverage === "Not provided" ? <MissingValue /> : spatialCoverage}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
                  Resolution
                </dt>
                <dd className="mt-1 text-foreground">
                  {dataset.spatialResolution ?? <MissingValue />}
                </dd>
              </div>
            </dl>
          </Section>

          <Section id="temporal-coverage" title="Temporal Coverage">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
                  Coverage
                </dt>
                <dd className="mt-1 text-foreground">{coverage}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
                  Resolution
                </dt>
                <dd className="mt-1 text-foreground">
                  {dataset.temporalResolution ?? <MissingValue />}
                </dd>
              </div>
            </dl>
          </Section>

          <Section id="files-formats" title="Files & Formats">
            {dataset.formats.length ? (
              <ul className="flex flex-wrap gap-2" aria-label="Data formats">
                {dataset.formats.map((format) => (
                  <li className="border border-border px-3 py-1 text-sm text-foreground" key={format}>
                    {format}
                  </li>
                ))}
              </ul>
            ) : (
              <MissingValue />
            )}
          </Section>

          <Section id="source-citation" title="Source & Citation">
            <dl className="grid gap-3">
              <div>
                <dt className="font-medium text-foreground">Journal article</dt>
                <dd>
                  {dataset.paperUrl ? (
                    <ExternalValue href={dataset.paperUrl}>
                      {dataset.journal ?? "Source article"}
                    </ExternalValue>
                  ) : (
                    <MissingValue />
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Original repository</dt>
                <dd>
                  {dataset.repository ? (
                    dataset.datasetUrl ? (
                      <ExternalValue href={dataset.datasetUrl}>
                        {dataset.repositoryTitle ?? dataset.repository}
                      </ExternalValue>
                    ) : (
                      dataset.repository
                    )
                  ) : (
                    <MissingValue />
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Article-cited dataset DOI</dt>
                <dd>
                  {datasetDoi ? (
                    <ExternalValue href={doiUrl(datasetDoi)}>{datasetDoi}</ExternalValue>
                  ) : (
                    <MissingValue />
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Verification evidence</dt>
                <dd>
                  <ul className="mt-1 flex flex-col gap-1.5">
                    {dataset.verification.evidence.map((evidence) => (
                      <li key={`${evidence.kind}-${evidence.url}`}>
                        <ExternalValue href={evidence.url}>{evidence.label}</ExternalValue>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-2 block text-xs text-muted">
                    Checked {dataset.verification.verifiedAt}
                  </span>
                </dd>
              </div>
            </dl>
            <p className="mt-4 border-l-2 border-border pl-4 font-mono text-[13px] leading-6 text-foreground">
              {citation}
            </p>
            {dataset.verificationNotes?.length ? (
              <div className="mt-5 border border-border bg-surface p-4">
                <h3 className="text-sm font-semibold text-foreground">Verification notes</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
                  {dataset.verificationNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Section>

          <Section id="license-access" title="License & Access">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-foreground">License</dt>
                <dd>{dataset.license ?? <MissingValue />}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Access type</dt>
                <dd>{accessLabel}</dd>
              </div>
            </dl>
            <p className="mt-4">
              SciData provides metadata and discovery links only. Access terms
              and files are controlled by the original repository.
            </p>
          </Section>
        </div>

        <aside className="order-first grid gap-4 self-start sm:grid-cols-2 lg:order-none lg:sticky lg:top-24 lg:grid-cols-1">
          <section className="border border-border p-5">
            <h2 className="text-base font-semibold">Quick facts</h2>
            <dl className="mt-5 grid gap-5">
              <QuickFact
                icon={<Layers className="size-5" strokeWidth={1.5} />}
                label="Discipline"
                value={primaryDiscipline}
              />
              <QuickFact
                icon={<Globe className="size-5" strokeWidth={1.5} />}
                label="Spatial coverage"
                value={spatialCoverage}
              />
              <QuickFact
                icon={<Calendar className="size-5" strokeWidth={1.5} />}
                label="Temporal coverage"
                value={coverage}
              />
              <QuickFact
                icon={<Clock className="size-5" strokeWidth={1.5} />}
                label="Temporal resolution"
                value={dataset.temporalResolution ?? "Not provided"}
              />
              <QuickFact
                icon={<File className="size-5" strokeWidth={1.5} />}
                label="Formats"
                value={dataset.formats.join(", ") || "Not provided"}
              />
              <QuickFact
                icon={
                  dataset.access === "open" ? (
                    <Unlock className="size-5" strokeWidth={1.5} />
                  ) : (
                    <Lock className="size-5" strokeWidth={1.5} />
                  )
                }
                label="Access"
                value={accessLabel}
              />
              <QuickFact
                icon={<BadgeCheck className="size-5" strokeWidth={1.5} />}
                label="Metadata status"
                value={
                  dataset.verification.status === "verified"
                    ? `Verified ${dataset.verification.verifiedAt}`
                    : dataset.verification.status
                }
              />
            </dl>
          </section>

          <section className="border border-border p-5">
            <div className="flex items-center gap-2">
              <Users aria-hidden="true" className="size-4 text-accent" />
              <h2 className="text-base font-semibold">Authors</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              {dataset.authors.length ? dataset.authors.join(", ") : "Not provided"}
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
