import { ArrowUpRight, Database, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export function AboutPage() {
  useDocumentMeta({
    title: "About | SciData",
    description:
      "SciData helps researchers discover reusable scientific datasets across disciplines.",
  });

  return (
    <main>
      <section className="content-container py-14 sm:py-20">
        <div className="max-w-4xl">
          <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-6xl">
            A clearer path to reusable scientific data.
          </h1>
          <p className="mt-7 max-w-3xl text-xl leading-9 text-muted">
            SciData helps researchers discover reusable scientific datasets
            across disciplines.
          </p>
        </div>
      </section>

      <section className="border-y border-border">
        <div className="content-container grid md:grid-cols-3">
          <article className="py-8 md:border-r md:px-7 md:first:pl-0">
            <Search aria-hidden="true" className="size-6 text-accent" strokeWidth={1.5} />
            <h2 className="mt-5 text-lg font-semibold">Discover</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Browse, search, and filter dataset metadata by discipline, region,
              year, format, and access type.
            </p>
          </article>
          <article className="border-t border-border py-8 md:border-r md:border-t-0 md:px-7">
            <Database aria-hidden="true" className="size-6 text-accent" strokeWidth={1.5} />
            <h2 className="mt-5 text-lg font-semibold">Follow the source</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              SciData does not host the original datasets. Dataset files remain
              hosted by their original repositories.
            </p>
          </article>
          <article className="border-t border-border py-8 md:border-t-0 md:px-7 md:last:pr-0">
            <ShieldCheck aria-hidden="true" className="size-6 text-accent" strokeWidth={1.5} />
            <h2 className="mt-5 text-lg font-semibold">Metadata, with context</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Every production record links both to its Nature Portfolio article
              and to the original data repository used to verify the metadata.
            </p>
          </article>
        </div>
      </section>

      <section className="content-container grid gap-10 py-14 sm:py-20 md:grid-cols-[220px_minmax(0,1fr)]">
        <h2 className="text-2xl font-semibold tracking-tight">How SciData works</h2>
        <div className="max-w-3xl space-y-5 text-[16px] leading-8 text-muted">
          <p>
            SciData is a static-first React application. Dataset
            metadata is loaded from a local JSON catalogue, indexed in the
            browser, and combined with URL-based filters so searches can be shared.
          </p>
          <p>
            There is no account system, database, application server, or paid API.
            A record is marked verified only after its article DOI, repository
            landing page, access status, and license have been checked against
            authoritative sources. SciData does not evaluate whether a dataset is
            scientifically suitable for a particular analysis.
          </p>
          <Link
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-accent underline-offset-4 hover:underline"
            to="/explore"
          >
            Explore verified datasets
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
