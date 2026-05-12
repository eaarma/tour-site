import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="page-container py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border border-base-200 bg-base-100 p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.24em] text-primary">
          About
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-base-content">
          About this site
        </h1>
        <p className="mt-4 text-base text-base-content/75 leading-7">
          This page is a placeholder for the About section. Content about the
          platform and the team will be added here soon.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/" className="btn btn-outline btn-sm">
            Back to home
          </Link>
          <p className="text-sm text-base-content/60">
            Need help now? Visit the FAQ or contact page for more information.
          </p>
        </div>
      </div>
    </main>
  );
}
