import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteBook } from "@/components/invite/InviteBook";
import { getInviteByHousehold, markInviteOpened } from "@/lib/data";
import { formatLongDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const invite = await getInviteByHousehold(slug);
  if (!invite) return { title: "Convite não encontrado" };

  const { event } = invite;
  return {
    title: `${event.couple_names} — ${event.title}`,
    description: `${formatLongDate(event.event_date)}${
      event.venue_name ? ` · ${event.venue_name}` : ""
    }`,
    robots: { index: false, follow: false },
  };
}

export default async function InvitePage({ params }: Props) {
  const { slug } = await params;
  const invite = await getInviteByHousehold(slug);
  if (!invite) notFound();

  if (invite.household) await markInviteOpened(invite.household.id);

  return <InviteBook invite={invite} />;
}
