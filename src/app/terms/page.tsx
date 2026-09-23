import type { Metadata } from "next";
import Link from "next/link";
import { TERMS_OF_SERVICE } from "@/src/lib/content/terms-of-service";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Track Markets Terms of Service and important trading risk notice.",
  alternates: { canonical: "/terms" },
};

const chunks = TERMS_OF_SERVICE.trim().split(/\n⸻\n/).map((chunk) => chunk.trim());
const opening = chunks[0].split(/\n\n+/);
const dates = opening[3].split("\n");
const sections = chunks.slice(1, 41).map((chunk) => {
  const [heading, ...body] = chunk.split("\n");
  const match = heading.match(/^(\d+)\. (.+)$/);
  if (!match) throw new Error("Invalid Terms of Service section heading.");
  return { number: Number(match[1]), title: match[2], body: body.join("\n").trim() };
});
const riskNotice = chunks[41].split("\n").slice(1).join("\n").trim();
const closing = chunks[42].split(/\n\n+/);

function TermsText({ text }: { text: string }) {
  return text.split(/\n\n+/).map((block, index) => {
    const lines = block.split("\n");
    if (lines.every((line) => line.startsWith("* "))) {
      return (
        <ul key={index} className="list-disc space-y-1 pl-6 text-sm leading-7 text-secondary/80 sm:text-base">
          {lines.map((line) => <li key={line}>{line.slice(2)}</li>)}
        </ul>
      );
    }
    if (lines.every((line) => /^\d+\. /.test(line))) {
      return (
        <ol key={index} className="list-decimal space-y-1 pl-6 text-sm leading-7 text-secondary/80 sm:text-base">
          {lines.map((line) => <li key={line}>{line.replace(/^\d+\. /, "")}</li>)}
        </ol>
      );
    }
    return <p key={index} className="whitespace-pre-line text-sm leading-7 text-secondary/80 sm:text-base">{block}</p>;
  });
}

function SectionLinks() {
  return (
    <ol className="menu menu-sm max-h-[calc(100dvh-12rem)] flex-nowrap overflow-y-auto px-0">
      {sections.map((section) => (
        <li key={section.number}>
          <a href={`#section-${section.number}`} className="gap-2 text-secondary/70 hover:bg-primary hover:text-secondary">
            <span className="w-6 shrink-0 text-accent">{String(section.number).padStart(2, "0")}</span>
            <span className="min-w-0">{section.title}</span>
          </a>
        </li>
      ))}
      <li>
        <a href="#risk-notice" className="gap-2 text-secondary/70 hover:bg-primary hover:text-secondary">
          <span className="w-6 shrink-0 text-accent">!</span>
          <span>IMPORTANT RISK NOTICE</span>
        </a>
      </li>
    </ol>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-dvh w-full bg-background text-secondary">
      <header className="border-b border-secondary/10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link href="/" className="font-semibold tracking-tight text-secondary hover:text-accent">
            TRACK MARKETS
          </Link>
          <Link href="/register" className="btn btn-ghost btn-sm text-secondary">
            Back to sign up
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">TRACK MARKETS</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-secondary sm:text-4xl">TERMS OF SERVICE</h1>
          <p className="mt-3 text-sm text-secondary/60">{opening[2]}</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-xs text-secondary/60">
            {dates.map((date) => <span key={date}>{date}</span>)}
          </div>
          <div className="card mt-8 gap-4 rounded-2xl border border-secondary/10 bg-primary/40 p-5 sm:p-7">
            {opening.slice(4).map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-secondary/80 sm:text-base">{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-6">
            <details className="rounded-xl border border-secondary/10 bg-primary/30 p-4 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold text-secondary">On this page</summary>
              <div className="mt-3 border-t border-secondary/10 pt-2"><SectionLinks /></div>
            </details>
            <nav aria-label="Terms sections" className="hidden rounded-xl border border-secondary/10 bg-primary/30 p-4 lg:block">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-secondary/50">On this page</p>
              <SectionLinks />
            </nav>
          </aside>

          <article className="min-w-0">
            {sections.map((section) => (
              <section key={section.number} id={`section-${section.number}`} className="scroll-mt-6 border-b border-secondary/10 py-8 first:pt-0">
                <div className="flex items-start gap-4">
                  <span className="w-7 shrink-0 pt-1 text-sm font-semibold text-accent">{String(section.number).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold leading-7 text-secondary sm:text-xl">{section.title}</h2>
                    <div className="mt-4 space-y-4"><TermsText text={section.body} /></div>
                  </div>
                </div>
              </section>
            ))}

            <section id="risk-notice" className="card mt-10 scroll-mt-6 gap-4 rounded-2xl border border-error/20 bg-error/5 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-secondary sm:text-xl">IMPORTANT RISK NOTICE</h2>
              <TermsText text={riskNotice} />
            </section>

            <div className="mt-12 border-t border-secondary/10 pt-8 text-center text-sm text-secondary/60">
              {closing.map((line) => <p key={line} className="mt-2 first:mt-0">{line}</p>)}
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
