"use client";

import { useBook } from "@/components/book/PageBook";
import type { InvitePage, MenuItem } from "@/lib/types";
import { MenuIconGlyph } from "../MenuIcons";
import { PageShell, hasMedia } from "../PageShell";

type Props = {
  page: InvitePage;
  /** Mapa de destino (`kind` ou `config.slug`) para índice de página. */
  targets: Record<string, number>;
};

export function MenuPage({ page, targets }: Props) {
  const { goTo } = useBook();
  const dark = hasMedia(page);
  const items = (page.config.items ?? []) as MenuItem[];
  const available = items.filter((item) => item.target in targets);

  return (
    <PageShell page={page} ornaments={false}>
      <div
        className={`flex flex-1 flex-col text-center ${
          dark ? "justify-end" : "justify-center"
        }`}
      >
        {page.eyebrow && (
          <p
            className={`eyebrow ${dark ? "text-white/85" : "text-ink-soft"}`}
          >
            {page.eyebrow}
          </p>
        )}
        {page.title && (
          <p
            className={`script mt-1 text-[2.4rem] ${
              dark ? "text-white" : "text-accent-ink"
            }`}
          >
            {page.title}
          </p>
        )}

        <ul className="mt-7 grid grid-cols-3 gap-x-3 gap-y-6">
          {available.map((item) => (
            <li key={item.target}>
              <button
                type="button"
                onClick={() => goTo(targets[item.target])}
                className="flex w-full flex-col items-center gap-2"
              >
                <span
                  className={`grid h-14 w-14 place-items-center rounded-full border ${
                    dark
                      ? "border-white/45 bg-white/10 text-white"
                      : "border-accent/40 bg-accent/10 text-accent-ink"
                  }`}
                >
                  <MenuIconGlyph name={item.icon} />
                </span>
                <span
                  className={`display text-[0.68rem] leading-tight tracking-[0.1em] uppercase ${
                    dark ? "text-white/90" : "text-ink-soft"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
