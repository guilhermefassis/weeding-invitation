import type { EventRecord, InvitePage } from "@/lib/types";
import { formatLongDate, formatWeekdayTime } from "@/lib/format";
import { PageShell, hasMedia } from "../PageShell";

function mapsQuery(event: EventRecord): string {
  if (event.venue_lat != null && event.venue_lng != null) {
    return `${event.venue_lat},${event.venue_lng}`;
  }
  return [event.venue_name, event.venue_address].filter(Boolean).join(" ");
}

export function LocationPage({
  page,
  event,
}: {
  page: InvitePage;
  event: EventRecord;
}) {
  const dark = hasMedia(page);
  const query = mapsQuery(event);
  const encoded = encodeURIComponent(query);
  const mapsUrl =
    event.venue_maps_url ?? `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  return (
    <PageShell page={page} ornaments={false}>
      <div className="flex flex-1 flex-col text-center">
        {page.eyebrow && (
          <p className={`eyebrow ${dark ? "text-white/80" : "text-accent"}`}>
            {page.eyebrow}
          </p>
        )}

        <h2
          className={`script mt-2 text-[2.6rem] ${dark ? "text-white" : "text-ink"}`}
        >
          {page.title ?? event.venue_name}
        </h2>

        <p
          className={`display mt-3 text-[0.82rem] tracking-[0.18em] uppercase ${
            dark ? "text-white/80" : "text-ink-soft"
          }`}
        >
          {formatLongDate(event.event_date)} · {formatWeekdayTime(event.event_date)}
        </p>

        {event.venue_address && (
          <p
            className={`display mt-4 text-[1.05rem] leading-relaxed ${
              dark ? "text-white/90" : "text-ink-soft"
            }`}
          >
            {event.venue_address}
          </p>
        )}

        {query && (
          <div className="mt-6 overflow-hidden rounded-xl border border-ink/10 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7)]">
            <iframe
              title="Mapa do local"
              src={`https://www.google.com/maps?q=${encoded}&z=15&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-56 w-full border-0"
            />
          </div>
        )}

        {page.body && (
          <p
            className={`display mt-5 text-[0.98rem] whitespace-pre-line ${
              dark ? "text-white/85" : "text-ink-soft"
            }`}
          >
            {page.body}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3">
          <a className="btn btn-primary" href={mapsUrl} target="_blank" rel="noreferrer">
            Abrir no Google Maps
          </a>
          <a
            className="btn btn-ghost"
            href={`https://waze.com/ul?q=${encoded}&navigate=yes`}
            target="_blank"
            rel="noreferrer"
          >
            Abrir no Waze
          </a>
        </div>
      </div>
    </PageShell>
  );
}
