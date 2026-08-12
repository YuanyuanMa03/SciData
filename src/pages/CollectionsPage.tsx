import { ArrowUpRight, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import { COLLECTIONS } from "../data/collections";
import { DISCIPLINES } from "../data/disciplines";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const DISCIPLINE_NAMES = new Map(
  DISCIPLINES.map((discipline) => [discipline.slug, discipline.name]),
);

function collectionUrl(collection: (typeof COLLECTIONS)[number]) {
  const params = new URLSearchParams({ q: collection.query });

  collection.disciplines?.forEach((discipline) => {
    params.append("discipline", discipline);
  });
  if ("regions" in collection) {
    collection.regions?.forEach((region) => {
      params.append("region", region.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    });
  }

  return `/explore?${params.toString()}`;
}

export function CollectionsPage() {
  useDocumentMeta({
    title: "Dataset collections | SciData",
    description:
      "Browse curated pathways through SciData's verified Nature Portfolio dataset catalogue.",
  });

  return (
    <main className="content-container py-12 sm:py-16">
      <header className="max-w-3xl">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Collections
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Focused starting points for common research themes. Each collection
          opens a live search across the source-verified local catalogue.
        </p>
      </header>

      <ol className="mt-12 border-t border-border">
        {COLLECTIONS.map((collection, index) => {
          const labels = [
            ...(collection.disciplines ?? []).map(
              (slug) => DISCIPLINE_NAMES.get(slug) ?? slug,
            ),
            ...("regions" in collection ? collection.regions : []),
            ...(collection.keywords ?? []).slice(0, 2),
          ];

          return (
            <li className="border-b border-border" key={collection.slug}>
              <Link
                className="group grid gap-5 py-7 sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:items-start sm:px-3 sm:py-9"
                to={collectionUrl(collection)}
              >
                <span className="font-mono text-sm text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-xl font-semibold tracking-tight group-hover:text-accent sm:text-2xl">
                    <Layers3 aria-hidden="true" className="size-5 shrink-0 text-accent" strokeWidth={1.5} />
                    {collection.name}
                  </span>
                  <span className="mt-2 block max-w-3xl text-[15px] leading-7 text-muted">
                    {collection.description}
                  </span>
                  <span className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Collection topics">
                    {labels.map((label) => (
                      <span className="text-xs text-muted" key={label}>
                        {label}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="inline-flex min-h-11 items-center gap-2 self-center text-sm font-semibold text-accent">
                  Explore collection
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
