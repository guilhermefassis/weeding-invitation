"use client";

import { useMemo, useState } from "react";
import { PageBook } from "@/components/book/PageBook";
import type { Invite, InvitePage } from "@/lib/types";
import { Envelope } from "./Envelope";
import { MusicPlayer } from "./MusicPlayer";
import { themeStyle } from "./theme";
import { CoverPage } from "./pages/CoverPage";
import { MenuPage } from "./pages/MenuPage";
import { ContentPage } from "./pages/ContentPage";
import { GalleryPage } from "./pages/GalleryPage";
import { RsvpPage } from "./pages/RsvpPage";
import { LocationPage } from "./pages/LocationPage";
import { GiftPage } from "./pages/GiftPage";
import { ClosingPage } from "./pages/ClosingPage";

function buildTargets(pages: InvitePage[]): Record<string, number> {
  const targets: Record<string, number> = {};
  pages.forEach((page, index) => {
    if (!(page.kind in targets)) targets[page.kind] = index;
    const slug = page.config.slug;
    if (typeof slug === "string") targets[slug] = index;
  });
  return targets;
}

export function InviteBook({ invite }: { invite: Invite }) {
  const { event, pages, household } = invite;
  const targets = useMemo(() => buildTargets(pages), [pages]);
  const [opened, setOpened] = useState(false);

  return (
    <div className="stage" style={themeStyle(event.theme)}>
      <div className="stage-inner">
        {!opened && event.monogram && (
          <Envelope
            monogram={event.monogram}
            recipient={household?.greeting ?? household?.family_name ?? null}
            onOpen={() => setOpened(true)}
          />
        )}

        <PageBook>
          {pages.map((page) => {
            switch (page.kind) {
              case "cover":
                return (
                  <CoverPage
                    key={page.id}
                    page={page}
                    event={event}
                    household={household}
                  />
                );
              case "menu":
                return <MenuPage key={page.id} page={page} targets={targets} />;
              case "gallery":
                return <GalleryPage key={page.id} page={page} />;
              case "rsvp":
                return (
                  <RsvpPage
                    key={page.id}
                    page={page}
                    household={household}
                    deadline={event.rsvp_deadline}
                  />
                );
              case "location":
                return <LocationPage key={page.id} page={page} event={event} />;
              case "gift":
                return (
                  <GiftPage
                    key={page.id}
                    page={page}
                    event={event}
                    household={household}
                  />
                );
              case "closing":
                return <ClosingPage key={page.id} page={page} event={event} />;
              default:
                return <ContentPage key={page.id} page={page} />;
            }
          })}
        </PageBook>

        {event.music_url && <MusicPlayer src={event.music_url} />}
      </div>
    </div>
  );
}
