import "server-only";
import { createAdminClient, hasSupabase } from "./supabase/admin";
import { demoInvite } from "./demo-data";
import type { EventRecord, GuestStatus, Household, Invite, InvitePage } from "./types";

const EVENT_COLUMNS =
  "id, slug, couple_names, monogram, title, blessing_line, event_date, venue_name, venue_address, venue_maps_url, venue_lat, venue_lng, music_url, theme, pix_key, pix_key_owner, pix_city, pix_suggestions, whatsapp_template, base_url";

const PAGE_COLUMNS =
  "id, position, kind, is_visible, eyebrow, title, subtitle, body, background_url, background_kind, overlay, config";

const HOUSEHOLD_COLUMNS =
  "id, event_id, slug, family_name, greeting, phone, note, invite_status, invite_sent_at, responded_at";

const GUEST_COLUMNS = "id, name, is_child, position, status";

export function isDemoMode(): boolean {
  return !hasSupabase();
}

async function loadEventPages(eventId: string): Promise<InvitePage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invite_pages")
    .select(PAGE_COLUMNS)
    .eq("event_id", eventId)
    .order("position");

  if (error) throw error;
  return (data ?? []) as InvitePage[];
}

/** Convite de uma família, pelo slug do link único. */
export async function getInviteByHousehold(slug: string): Promise<Invite | null> {
  if (isDemoMode()) return demoInvite;

  const supabase = createAdminClient();
  const { data: household, error } = await supabase
    .from("households")
    .select(`${HOUSEHOLD_COLUMNS}, guests(${GUEST_COLUMNS})`)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!household) return null;

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("id", household.event_id)
    .single();

  if (eventError) throw eventError;

  const guests = [...((household.guests ?? []) as Household["guests"])].sort(
    (a, b) => a.position - b.position,
  );

  return {
    event: event as EventRecord,
    pages: (await loadEventPages(event.id)).filter((page) => page.is_visible),
    household: { ...(household as unknown as Household), guests },
  };
}

/** Prévia do convite sem família associada (usada no painel e no /demo). */
export async function getEventPreview(slug?: string): Promise<Invite | null> {
  if (isDemoMode()) return { ...demoInvite, household: null };

  const supabase = createAdminClient();
  const query = supabase.from("events").select(EVENT_COLUMNS).limit(1);
  const { data, error } = slug
    ? await query.eq("slug", slug).maybeSingle()
    : await query.order("created_at").maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const event = data as EventRecord;
  return {
    event,
    pages: (await loadEventPages(event.id)).filter((page) => page.is_visible),
    household: null,
  };
}

export async function markInviteOpened(householdId: string): Promise<void> {
  if (isDemoMode()) return;
  const supabase = createAdminClient();
  await supabase
    .from("households")
    .update({ opened_at: new Date().toISOString() })
    .eq("id", householdId)
    .is("opened_at", null);
}

export type RsvpInput = {
  householdSlug: string;
  answers: { guestId: string; status: GuestStatus }[];
  note?: string;
};

export async function saveRsvp({ householdSlug, answers, note }: RsvpInput) {
  if (isDemoMode()) return { demo: true as const };

  const supabase = createAdminClient();
  const { data: household, error } = await supabase
    .from("households")
    .select("id")
    .eq("slug", householdSlug)
    .single();

  if (error) throw error;

  for (const answer of answers) {
    const { error: guestError } = await supabase
      .from("guests")
      .update({ status: answer.status })
      .eq("id", answer.guestId)
      .eq("household_id", household.id);
    if (guestError) throw guestError;
  }

  const { error: householdError } = await supabase
    .from("households")
    .update({ note: note ?? null, responded_at: new Date().toISOString() })
    .eq("id", household.id);

  if (householdError) throw householdError;
  return { demo: false as const };
}

export type GiftMessageInput = {
  eventId: string;
  householdSlug?: string | null;
  name?: string | null;
  amount?: number | null;
  message?: string | null;
};

export async function saveGiftMessage(input: GiftMessageInput) {
  if (isDemoMode()) return { demo: true as const };

  const supabase = createAdminClient();
  let householdId: string | null = null;

  if (input.householdSlug) {
    const { data } = await supabase
      .from("households")
      .select("id")
      .eq("slug", input.householdSlug)
      .maybeSingle();
    householdId = data?.id ?? null;
  }

  const { error } = await supabase.from("gift_messages").insert({
    event_id: input.eventId,
    household_id: householdId,
    name: input.name ?? null,
    amount: input.amount ?? null,
    message: input.message ?? null,
  });

  if (error) throw error;
  return { demo: false as const };
}
