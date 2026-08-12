import { ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export function NotFoundPage() {
  useDocumentMeta({
    title: "Page not found | SciData",
    description: "The requested SciData page could not be found.",
  });

  return (
    <main className="content-container flex min-h-[calc(100vh-var(--header-height)-160px)] items-center py-16">
      <div className="max-w-2xl">
        <p className="font-mono text-sm text-accent">404 / NOT FOUND</p>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          This page is outside the catalogue.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
          The address may be incomplete, or the page may have moved. Return home
          or continue browsing scientific datasets.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-11 items-center gap-2 bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover"
            to="/"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back home
          </Link>
          <Link
            className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm font-semibold hover:border-accent hover:text-accent"
            to="/explore"
          >
            <Search aria-hidden="true" className="size-4" />
            Explore datasets
          </Link>
        </div>
      </div>
    </main>
  );
}
