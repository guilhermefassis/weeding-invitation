import { formatDateStamp, formatWeekdayTime } from "@/lib/format";
import type { EventRecord, Household, InvitePage } from "@/lib/types";
import { Monogram } from "../Ornament";
import { PageShell, hasMedia } from "../PageShell";

type Props = {
  page: InvitePage;
  event: EventRecord;
  household: Household | null;
};

/**
 * O "e" comercial da caligráfica é ambíguo; papelaria fina costuma resolver
 * com uma serifada itálica menor entre os dois nomes.
 */
function CoupleNames({ names }: { names: string }) {
  const parts = names.split(/\s*&\s*/);
  if (parts.length !== 2) return <>{names}</>;

  // Cada nome na sua linha, com o "e" comercial isolado entre eles.
  return (
    <>
      <span className="block">{parts[0]}</span>
      <span className="display my-1 block text-[0.3em] italic opacity-60">
        &amp;
      </span>
      <span className="block">{parts[1]}</span>
    </>
  );
}

export function CoverPage({ page, event, household }: Props) {
  const dark = hasMedia(page);

  return (
    <PageShell page={page}>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {event.monogram && (
          <Monogram
            text={event.monogram}
            className="mx-auto mb-7 block h-[4.6rem] w-44 text-accent-ink"
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
          className={`script text-[clamp(2.6rem,calc(12.5vw*var(--font-scale,1)),3.9rem)] leading-[1.05] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          <CoupleNames names={event.couple_names} />
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
            dark ? "text-white/70" : "text-accent-ink"
          }`}
        >
          {household.greeting}
        </p>
      )}
    </PageShell>
  );
}
