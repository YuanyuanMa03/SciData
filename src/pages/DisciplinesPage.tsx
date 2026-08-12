import {
  Atom,
  Brain,
  Building2,
  ChevronRight,
  CircleDot,
  CloudSun,
  Cpu,
  Dna,
  FlaskConical,
  Globe2,
  HeartPulse,
  Sprout,
  Telescope,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { DISCIPLINES } from "../data/disciplines";
import { useDatasets } from "../hooks/useDatasets";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const DISCIPLINE_ICONS: Record<string, LucideIcon> = {
  Atom,
  Brain,
  Building2,
  CloudSun,
  Cpu,
  Dna,
  FlaskConical,
  Globe2,
  HeartPulse,
  Sprout,
  Telescope,
  Users,
  Waves,
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

export function DisciplinesPage() {
  const { datasets, loading, error } = useDatasets();

  useDocumentMeta({
    title: "Scientific disciplines | SciData",
    description:
      "Browse verified Nature Portfolio dataset metadata by scientific discipline.",
  });

  const counts = useMemo(() => {
    return new Map(
      DISCIPLINES.map((discipline) => {
        const candidateNames: Array<string | undefined> = [
          discipline.name,
          "shortName" in discipline ? discipline.shortName : undefined,
          discipline.slug,
        ];
        const acceptedNames = new Set(
          candidateNames
            .filter((value): value is string => Boolean(value))
            .map(normalize),
        );
        const count = datasets.filter((dataset) =>
          dataset.disciplines.some((value) => acceptedNames.has(normalize(value))),
        ).length;

        return [discipline.slug, count] as const;
      }),
    );
  }, [datasets]);

  return (
    <main className="content-container py-12 sm:py-16">
      <header className="max-w-3xl">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Scientific disciplines
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Explore scientific dataset metadata by field, from earth systems and
          health to physics and computing.
        </p>
        <p className="mt-3 text-sm text-muted">
          Dataset counts reflect the current source-verified local catalogue.
        </p>
      </header>

      {error ? (
        <p className="mt-10 border-l-2 border-warning pl-4 text-sm text-warning" role="status">
          Dataset counts are unavailable because the local catalogue could not be loaded.
        </p>
      ) : null}

      <ul className="mt-12 grid border-t border-border md:grid-cols-2">
        {DISCIPLINES.map((discipline, index) => {
          const Icon = DISCIPLINE_ICONS[discipline.icon] ?? CircleDot;
          const count = counts.get(discipline.slug) ?? 0;

          return (
            <li
              className={`border-b border-border ${index % 2 === 0 ? "md:border-r" : ""}`}
              key={discipline.slug}
            >
              <Link
                className="group grid min-h-44 grid-cols-[48px_minmax(0,1fr)_24px] gap-5 px-1 py-7 sm:px-5"
                to={`/explore?discipline=${encodeURIComponent(discipline.slug)}`}
              >
                <span className="flex size-12 items-center justify-center border border-accent/25 text-accent transition-colors group-hover:border-accent group-hover:bg-accent-soft">
                  <Icon aria-hidden="true" className="size-6" strokeWidth={1.5} />
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-semibold tracking-tight group-hover:text-accent">
                    {discipline.name}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-muted">
                    {discipline.description}
                  </span>
                  <span className="mt-4 block font-mono text-xs text-muted">
                    {loading
                      ? "Loading count…"
                      : error
                        ? "Count unavailable"
                        : `${count} ${count === 1 ? "dataset" : "datasets"}`}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="mt-1 size-5 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
