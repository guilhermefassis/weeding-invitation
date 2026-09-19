import type { InvitePage } from "@/lib/types";
import { PageShell, hasMedia } from "../PageShell";

export function ContentPage({ page }: { page: InvitePage }) {
  const dark = hasMedia(page);

  return (
    <PageShell page={page}>
      <div className="flex flex-1 flex-col justify-center text-center">
        {page.eyebrow && (
          <p className={`eyebrow ${dark ? "text-white/80" : "text-accent"}`}>
            {page.eyebrow}
          </p>
        )}

        {page.title && (
          <h2
            className={`script mt-3 text-[2.8rem] ${
              dark ? "text-white" : "text-ink"
            }`}
          >
            {page.title}
          </h2>
        )}

        {page.subtitle && (
          <p
            className={`display mt-2 text-[0.8rem] tracking-[0.22em] uppercase ${
              dark ? "text-white/75" : "text-ink-soft"
            }`}
          >
            {page.subtitle}
          </p>
        )}

        <div className="mx-auto my-7 w-28">
          <div className="rule" />
        </div>

        {page.body && (
          <p
            className={`display mx-auto max-w-[22rem] text-[1.1rem] leading-relaxed whitespace-pre-line ${
              dark ? "text-white/90" : "text-ink-soft"
            }`}
          >
            {page.body}
          </p>
        )}
      </div>
    </PageShell>
  );
}
