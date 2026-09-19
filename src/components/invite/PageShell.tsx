import type { ReactNode } from "react";
import type { InvitePage } from "@/lib/types";
import { Ornament } from "./Ornament";

type Props = {
  page: InvitePage;
  children: ReactNode;
  /** Ramos nos cantos — só nas páginas de papel. */
  ornaments?: boolean;
};

export function hasMedia(page: InvitePage): boolean {
  return page.background_kind !== "color" && Boolean(page.background_url);
}

export function PageShell({ page, children, ornaments = true }: Props) {
  const media = hasMedia(page);

  return (
    <article className="page" data-kind={page.kind}>
      {media && page.background_kind === "image" && (
        // Imagens vêm do Storage do Supabase, fora do otimizador do next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="page-bg" src={page.background_url!} alt="" />
      )}

      {media && page.background_kind === "video" && (
        <video
          className="page-bg"
          src={page.background_url!}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {media ? (
        <div className="page-overlay" style={{ opacity: page.overlay }} />
      ) : (
        <div className="paper-grain" />
      )}

      {!media && <div className="paper-frame" />}

      {!media && ornaments && (
        <Ornament className="pointer-events-none absolute bottom-[84px] left-[clamp(22px,5vw,32px)] z-[1] w-24 text-accent opacity-80" />
      )}

      <div className="page-content" data-tone={media ? "dark" : "light"}>
        {children}
      </div>
    </article>
  );
}
