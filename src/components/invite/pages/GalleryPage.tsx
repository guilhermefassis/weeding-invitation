import type { GalleryItem, InvitePage } from "@/lib/types";
import { PageShell, hasMedia } from "../PageShell";

export function GalleryPage({ page }: { page: InvitePage }) {
  const dark = hasMedia(page);
  const items = (page.config.gallery ?? []) as GalleryItem[];

  return (
    <PageShell page={page} ornaments={false}>
      <header className="text-center">
        {page.eyebrow && (
          <p className={`eyebrow ${dark ? "text-white/80" : "text-accent-ink"}`}>
            {page.eyebrow}
          </p>
        )}
        {page.title && (
          <h2
            className={`script mt-2 text-[2.4rem] ${
              dark ? "text-white" : "text-ink"
            }`}
          >
            {page.title}
          </h2>
        )}
      </header>

      {items.length === 0 ? (
        <p
          className={`display mt-10 text-center text-[0.95rem] ${
            dark ? "text-white/70" : "text-ink-soft"
          }`}
        >
          As fotos e vídeos aparecem aqui assim que forem enviados pelo painel.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {items.map((item, index) => (
            <figure
              key={`${item.url}-${index}`}
              className="overflow-hidden rounded-xl bg-black/5 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)]"
            >
              {item.kind === "video" ? (
                <video
                  src={item.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.caption ?? ""}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
              )}
              {item.caption && (
                <figcaption
                  className={`display px-3 py-2 text-center text-[0.8rem] ${
                    dark ? "text-white/80" : "text-ink-soft"
                  }`}
                >
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </PageShell>
  );
}
