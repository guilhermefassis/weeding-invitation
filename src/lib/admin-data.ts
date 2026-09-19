import "server-only";
import { createAdminClient } from "./supabase/admin";
import type { EventRecord, Household, InvitePage } from "./types";

export async function getAdminEvent(): Promise<EventRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as EventRecord) ?? null;
}

export async function listPages(eventId: string): Promise<InvitePage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invite_pages")
    .select("*")
    .eq("event_id", eventId)
    .order("position");

  if (error) throw new Error(error.message);
  return (data ?? []) as InvitePage[];
}

export async function listHouseholds(eventId: string): Promise<Household[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("households")
    .select("*, guests(*)")
    .eq("event_id", eventId)
    .order("family_name");

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as Household[]).map((household) => ({
    ...household,
    guests: [...household.guests].sort((a, b) => a.position - b.position),
  }));
}

export type GiftMessage = {
  id: string;
  name: string | null;
  amount: number | null;
  message: string | null;
  created_at: string;
};

export async function listGiftMessages(eventId: string): Promise<GiftMessage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gift_messages")
    .select("id, name, amount, message, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data ?? []) as GiftMessage[];
}
