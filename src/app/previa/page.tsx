import { notFound } from "next/navigation";
import { InviteBook } from "@/components/invite/InviteBook";
import { requireUser } from "@/lib/auth";
import { getEventPreview } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Prévia do convite",
  robots: { index: false, follow: false },
};

/** O convite como os convidados verão, sem precisar criar uma família. */
export default async function PreviewPage() {
  await requireUser();

  const invite = await getEventPreview();
  if (!invite) notFound();

  return <InviteBook invite={invite} />;
}
