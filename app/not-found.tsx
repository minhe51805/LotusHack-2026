import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-4xl flex-col items-center justify-center gap-5 px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
        404
      </span>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          This route is not part of the imported ETEST snapshot
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          The cloned dataset currently covers the main domain pages that were imported into the
          local content layer. Re-run the importer if you recently expanded the sitemap scope.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex min-w-44 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        Back to homepage
      </Link>
    </div>
  );
}
