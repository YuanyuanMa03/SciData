import {
  Atom,
  Brain,
  Building2,
  ChevronRight,
  CloudSun,
  Cpu,
  Database,
  Dna,
  Earth,
  FlaskConical,
  HeartPulse,
  LockKeyhole,
  LockKeyholeOpen,
  Sprout,
  Telescope,
  Waves,
  BadgeCheck,
} from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";

import type { DatasetAccess, ScientificDataset } from "../../types/dataset";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

export interface DatasetCardProps {
  dataset: ScientificDataset;
  variant?: "featured" | "result";
  className?: string;
}

function DatasetGlyph({
  dataset,
  className,
}: {
  dataset: ScientificDataset;
  className: string;
}) {
  const searchable = [...dataset.disciplines, ...dataset.keywords]
    .join(" ")
    .toLocaleLowerCase();

  const props = {
    className,
    strokeWidth: 1.5,
    "aria-hidden": true,
  } as const;

  if (searchable.includes("climate") || searchable.includes("meteorology")) {
    return <CloudSun {...props} />;
  }
  if (
    searchable.includes("agriculture") ||
    searchable.includes("soil") ||
    searchable.includes("forestry")
  ) {
    return <Sprout {...props} />;
  }
  if (searchable.includes("genomics") || searchable.includes("biology")) {
    return <Dna {...props} />;
  }
  if (
    searchable.includes("medicine") ||
    searchable.includes("health") ||
    searchable.includes("disease")
  ) {
    return <HeartPulse {...props} />;
  }
  if (searchable.includes("neuroscience")) {
    return <Brain {...props} />;
  }
  if (searchable.includes("chemistry")) {
    return <FlaskConical {...props} />;
  }
  if (searchable.includes("physics")) {
    return <Atom {...props} />;
  }
  if (searchable.includes("astronomy")) {
    return <Telescope {...props} />;
  }
  if (searchable.includes("computer")) {
    return <Cpu {...props} />;
  }
  if (searchable.includes("urban") || searchable.includes("social")) {
    return <Building2 {...props} />;
  }
  if (searchable.includes("ocean") || searchable.includes("water")) {
    return <Waves {...props} />;
  }
  if (searchable.includes("earth") || searchable.includes("environment")) {
    return <Earth {...props} />;
  }

  return <Database {...props} />;
}

function getTemporalCoverage(dataset: ScientificDataset) {
  if (dataset.temporalCoverage) {
    return dataset.temporalCoverage;
  }

  if (dataset.temporalStart === undefined && dataset.temporalEnd === undefined) {
    return "Not specified";
  }

  if (dataset.temporalStart === dataset.temporalEnd) {
    return String(dataset.temporalStart);
  }

  return [dataset.temporalStart, dataset.temporalEnd]
    .filter((value) => value !== undefined)
    .join("–");
}

const accessLabels: Record<DatasetAccess, string> = {
  open: "Open",
  restricted: "Restricted",
  registration: "Registration required",
};

function AccessLabel({ access }: { access: DatasetAccess }) {
  const AccessIcon = access === "open" ? LockKeyholeOpen : LockKeyhole;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        access === "open" ? "text-success" : "text-muted",
      )}
    >
      <AccessIcon className="size-4" strokeWidth={1.75} aria-hidden="true" />
      {accessLabels[access]}
    </span>
  );
}

function DatasetTags({ dataset }: { dataset: ScientificDataset }) {
  const tags = Array.from(
    new Set([...dataset.disciplines.slice(0, 2), ...dataset.regions.slice(0, 1)]),
  ).slice(0, 3);

  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Dataset categories">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline" className="border-accent/30 text-accent">
          {tag}
        </Badge>
      ))}
    </div>
  );
}

function FeaturedDatasetCard({
  dataset,
  className,
}: Pick<DatasetCardProps, "dataset" | "className">) {
  const temporalCoverage = getTemporalCoverage(dataset);

  return (
    <Link
      to={`/dataset/${encodeURIComponent(dataset.id)}`}
      className={cn(
        "group grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 bg-background px-2 py-5 transition-colors hover:bg-surface/55 sm:px-3 lg:grid-cols-[4.5rem_minmax(0,1.5fr)_minmax(12rem,0.8fr)_auto] lg:items-center",
        className,
      )}
    >
      <div className="flex size-[4.5rem] items-center justify-center rounded-md border border-border text-accent">
        <DatasetGlyph dataset={dataset} className="size-9" />
      </div>

      <div className="min-w-0 self-start sm:self-center">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold leading-6 text-foreground group-hover:text-accent sm:text-lg">
            {dataset.title}
          </h3>
          {dataset.verification.status === "verified" ? (
            <Badge variant="success">
              <BadgeCheck aria-hidden="true" className="size-3.5" />
              Source verified
            </Badge>
          ) : dataset.demo ? (
            <Badge variant="demo">Demo metadata</Badge>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
          {dataset.description}
        </p>
      </div>

      <dl className="col-start-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-xs leading-5 lg:col-auto">
        <dt className="font-mono text-muted">Published</dt>
        <dd className="text-foreground">{dataset.publicationYear}</dd>
        <dt className="font-mono text-muted">Temporal</dt>
        <dd className="truncate text-foreground">
          {dataset.temporalResolution ?? "Not specified"} ({temporalCoverage})
        </dd>
        <dt className="font-mono text-muted">Formats</dt>
        <dd className="truncate text-foreground">{dataset.formats.join(", ")}</dd>
        <dt className="font-mono text-muted">Source</dt>
        <dd className="truncate text-foreground">{dataset.journal ?? "Not provided"}</dd>
      </dl>

      <div className="col-start-2 flex flex-col items-start gap-3 lg:col-auto lg:items-end">
        <DatasetTags dataset={dataset} />
        <div className="flex w-full items-center justify-between gap-4 lg:justify-end">
          <AccessLabel access={dataset.access} />
          <ChevronRight
            className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}

function ResultDatasetCard({
  dataset,
  className,
}: Pick<DatasetCardProps, "dataset" | "className">) {
  const temporalCoverage = getTemporalCoverage(dataset);

  return (
    <Link
      to={`/dataset/${encodeURIComponent(dataset.id)}`}
      className={cn(
        "group grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:border-accent/45 hover:bg-accent-soft/40 xl:grid-cols-[3rem_minmax(16rem,2.7fr)_minmax(7rem,1fr)_minmax(6rem,0.9fr)_4.5rem_minmax(7rem,1fr)_minmax(5rem,0.7fr)_minmax(6rem,0.8fr)_auto] xl:items-center xl:gap-3 xl:rounded-none xl:border-x-0 xl:border-t-0 xl:px-4 xl:py-3",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center text-accent xl:size-10">
        <DatasetGlyph dataset={dataset} className="size-7" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold leading-5 text-foreground group-hover:text-accent">
            {dataset.title}
          </h3>
          {dataset.verification.status === "verified" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success xl:hidden">
              <BadgeCheck aria-hidden="true" className="size-3.5" />
              Source verified
            </span>
          ) : dataset.demo ? (
            <span className="text-[11px] font-medium text-warning xl:hidden">Demo metadata</span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-muted">
          {dataset.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-muted xl:hidden">
          <span>{dataset.disciplines[0] ?? "Unclassified"}</span>
          <span aria-hidden="true">·</span>
          <span>{dataset.regions[0] ?? "Not specified"}</span>
          <span aria-hidden="true">·</span>
          <span>{dataset.publicationYear}</span>
          <span aria-hidden="true">·</span>
          <span>{temporalCoverage}</span>
          <span aria-hidden="true">·</span>
          <span>{dataset.formats.join(", ")}</span>
        </div>

        <div className="mt-3 flex items-center justify-between xl:hidden">
          <AccessLabel access={dataset.access} />
          <span className="text-xs font-medium text-accent">
            {dataset.verification.status === "verified"
              ? dataset.journal ?? "Verified source"
              : dataset.demo
                ? "Demo metadata"
                : dataset.journal ?? "Dataset record"}
          </span>
        </div>
      </div>

      <span className="hidden text-xs leading-5 text-foreground xl:block">
        {dataset.disciplines[0] ?? "Unclassified"}
      </span>
      <span className="hidden text-xs leading-5 text-foreground xl:block">
        {dataset.regions[0] ?? "Not specified"}
      </span>
      <span className="hidden text-xs text-foreground xl:block">{dataset.publicationYear}</span>
      <span className="hidden text-xs leading-5 text-foreground xl:block">
        {temporalCoverage}
      </span>
      <span className="hidden truncate text-xs text-foreground xl:block">
        {dataset.formats.join(", ")}
      </span>
      <span className="hidden xl:block">
        <AccessLabel access={dataset.access} />
      </span>
      <div className="hidden min-w-0 items-center justify-end gap-2 xl:flex">
        <span className="truncate text-right text-xs font-medium text-accent">
          {dataset.verification.status === "verified"
            ? dataset.journal ?? "Verified source"
            : dataset.demo
              ? "Demo metadata"
              : dataset.journal ?? "Dataset record"}
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

export const DatasetCard = memo(function DatasetCard({
  dataset,
  variant = "featured",
  className,
}: DatasetCardProps) {
  return variant === "result" ? (
    <ResultDatasetCard dataset={dataset} className={className} />
  ) : (
    <FeaturedDatasetCard dataset={dataset} className={className} />
  );
});
