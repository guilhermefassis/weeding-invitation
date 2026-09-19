import { formatDateStamp, formatWeekdayTime } from "@/lib/format";
import type { EventRecord, Household, InvitePage } from "@/lib/types";
import { Monogram } from "../Ornament";
import { PageShell, hasMedia } from "../PageShell";

type Props = {
  page: InvitePage;
  event: EventRecord;
  household: Household | null;
};

export function CoverPage({ page, event, household }: Props) {
  const dark = hasMedia(page);

  return (
    <PageShell page={page}>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {event.monogram && (
          <Monogram
            text={event.monogram}
            className="mb-7 block h-24 w-24 text-accent"
          />
        )}

        {(page.eyebrow ?? event.blessing_line) && (
          <p
            className={`display mb-6 max-w-[16rem] text-[0.82rem] tracking-[0.18em] uppercase ${
              dark ? "text-white/85" : "text-ink-soft"
            }`}
          >
            {page.eyebrow ?? event.blessing_line}
          </p>
        )}

        <h1
          className={`script text-[clamp(3rem,15vw,4.6rem)] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {event.couple_names}
        </h1>

        <div className="my-8 w-40">
          <div className="rule" />
        </div>

        <p
          className={`display text-[0.74rem] tracking-[0.3em] uppercase ${
            dark ? "text-white/75" : "text-ink-soft"
          }`}
        >
          {event.title}
        </p>

        <p
          className={`display mt-5 text-[1.55rem] tracking-[0.12em] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {formatDateStamp(event.event_date)}
        </p>

        <p
          className={`display mt-1 text-[0.86rem] tracking-[0.2em] uppercase ${
            dark ? "text-white/80" : "text-ink-soft"
          }`}
        >
          {formatWeekdayTime(event.event_date)}
        </p>

        {event.venue_name && (
          <>
            <div className="my-7 w-24">
              <div className="rule" />
            </div>
            <p
              className={`display text-[0.8rem] tracking-[0.22em] uppercase ${
                dark ? "text-white/80" : "text-ink-soft"
              }`}
            >
              {event.venue_name}
            </p>
          </>
        )}
      </div>

      {household?.greeting && (
        <p
          className={`display text-center text-[0.76rem] tracking-[0.22em] uppercase ${
            dark ? "text-white/70" : "text-accent"
          }`}
        >
          {household.greeting}
        </p>
      )}
    </PageShell>
  );
}
