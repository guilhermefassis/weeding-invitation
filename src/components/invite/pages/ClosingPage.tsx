import type { EventRecord, InvitePage } from "@/lib/types";
import { Monogram } from "../Ornament";
import { PageShell, hasMedia } from "../PageShell";

export function ClosingPage({
  page,
  event,
}: {
  page: InvitePage;
  event: EventRecord;
}) {
  const dark = hasMedia(page);

  return (
    <PageShell page={page}>
      <div className="flex flex-1 flex-col items-center justify-end pb-6 text-center">
        {event.monogram && (
          <Monogram
            text={event.monogram}
            className={`mx-auto mb-5 block h-16 w-36 ${dark ? "text-white" : "text-accent"}`}
          />
        )}

        <h2
          className={`script text-[3.2rem] leading-[1.05] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {page.title ?? "Esperamos por você"}
        </h2>

        {page.body && (
          <p
            className={`display mt-4 max-w-[20rem] text-[1rem] whitespace-pre-line ${
              dark ? "text-white/85" : "text-ink-soft"
            }`}
          >
            {page.body}
          </p>
        )}
      </div>
    </PageShell>
  );
}
