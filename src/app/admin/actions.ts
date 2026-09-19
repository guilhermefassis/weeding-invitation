"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { householdSlug } from "@/lib/slug";
import { normalizePhone } from "@/lib/whatsapp";
import { hasCloudApi, sendWhatsappMessage } from "@/lib/whatsapp-cloud";

const BUCKET = "convite";

function text(form: FormData, key: string): string | null {
  const value = form.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function number(form: FormData, key: string): number | null {
  const value = text(form, key);
  if (value === null) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * O input datetime-local não carrega fuso. O Brasil não tem mais horário de
 * verão, então a data do evento é sempre lida como -03:00.
 */
function toTimestamp(value: string | null): string | null {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00-03:00` : value;
}

/** O prazo vale até o fim do dia escolhido. */
function toDeadline(value: string | null): string | null {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59-03:00` : value;
}

async function uploadMedia(file: File, prefix: string): Promise<string> {
  const supabase = createAdminClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${prefix}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Falha no upload: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ------------------------------------------------------------------ evento

export async function updateEvent(form: FormData) {
  await requireUser();
  const supabase = createAdminClient();
  const id = text(form, "id");
  if (!id) throw new Error("Evento não informado");

  const suggestions = (text(form, "pix_suggestions") ?? "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);

  const { error } = await supabase
    .from("events")
    .update({
      couple_names: text(form, "couple_names"),
      monogram: text(form, "monogram"),
      title: text(form, "title"),
      blessing_line: text(form, "blessing_line"),
      event_date: toTimestamp(text(form, "event_date")),
      rsvp_deadline: toDeadline(text(form, "rsvp_deadline")),
      venue_name: text(form, "venue_name"),
      venue_address: text(form, "venue_address"),
      venue_maps_url: text(form, "venue_maps_url"),
      venue_lat: number(form, "venue_lat"),
      venue_lng: number(form, "venue_lng"),
      music_url: text(form, "music_url"),
      pix_key: text(form, "pix_key"),
      pix_key_owner: text(form, "pix_key_owner"),
      pix_city: text(form, "pix_city"),
      pix_suggestions: suggestions,
      whatsapp_template: text(form, "whatsapp_template"),
      base_url: text(form, "base_url"),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/evento");
}

// ----------------------------------------------------------------- páginas

export async function updatePage(form: FormData) {
  await requireUser();
  const supabase = createAdminClient();
  const id = text(form, "id");
  if (!id) throw new Error("Página não informada");

  let backgroundUrl = text(form, "background_url");
  const file = form.get("background_file");
  if (file instanceof File && file.size > 0) {
    backgroundUrl = await uploadMedia(file, "paginas");
  }

  const { error } = await supabase
    .from("invite_pages")
    .update({
      eyebrow: text(form, "eyebrow"),
      title: text(form, "title"),
      subtitle: text(form, "subtitle"),
      body: text(form, "body"),
      background_url: backgroundUrl,
      background_kind: text(form, "background_kind") ?? "color",
      overlay: number(form, "overlay") ?? 0.35,
      is_visible: form.get("is_visible") === "on",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/paginas");
}

export async function addGalleryMedia(form: FormData) {
  await requireUser();
  const supabase = createAdminClient();
  const id = text(form, "id");
  const file = form.get("media");
  if (!id || !(file instanceof File) || file.size === 0) return;

  const url = await uploadMedia(file, "galeria");

  const { data, error } = await supabase
    .from("invite_pages")
    .select("config")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  const config = (data.config ?? {}) as Record<string, unknown>;
  const gallery = Array.isArray(config.gallery) ? config.gallery : [];
  gallery.push({
    url,
    kind: file.type.startsWith("video") ? "video" : "image",
    caption: text(form, "caption") ?? undefined,
  });

  const { error: updateError } = await supabase
    .from("invite_pages")
    .update({ config: { ...config, gallery } })
    .eq("id", id);

  if (updateError) throw new Error(updateError.message);
  revalidatePath("/admin/paginas");
}

export async function movePage(form: FormData) {
  await requireUser();
  const supabase = createAdminClient();
  const id = text(form, "id");
  const direction = text(form, "direction");
  if (!id || !direction) return;

  const { data: page, error } = await supabase
    .from("invite_pages")
    .select("id, event_id, position")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  const target = page.position + (direction === "up" ? -1 : 1);
  const { data: neighbour } = await supabase
    .from("invite_pages")
    .select("id, position")
    .eq("event_id", page.event_id)
    .eq("position", target)
    .maybeSingle();

  if (!neighbour) return;

  await supabase.from("invite_pages").update({ position: -1 }).eq("id", page.id);
  await supabase
    .from("invite_pages")
    .update({ position: page.position })
    .eq("id", neighbour.id);
  await supabase.from("invite_pages").update({ position: target }).eq("id", page.id);

  revalidatePath("/admin/paginas");
}

// -------------------------------------------------------------- convidados

/** "Ricardo Oliveira\nPedro (criança)" vira a lista de convidados da família. */
function parseGuests(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const isChild = /\(crian[çc]a\)/i.test(line);
      return {
        name: line.replace(/\(crian[çc]a\)/i, "").trim(),
        is_child: isChild,
        position: index,
      };
    });
}

export async function saveHousehold(form: FormData) {
  await requireUser();
  const supabase = createAdminClient();

  const id = text(form, "id");
  const eventId = text(form, "event_id");
  const familyName = text(form, "family_name");
  if (!familyName || !eventId) throw new Error("Nome da família é obrigatório");

  const payload = {
    event_id: eventId,
    family_name: familyName,
    greeting: text(form, "greeting"),
    phone: normalizePhone(text(form, "phone")),
  };

  let householdId = id;

  if (householdId) {
    const { error } = await supabase
      .from("households")
      .update(payload)
      .eq("id", householdId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("households")
      .insert({ ...payload, slug: householdSlug(familyName) })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    householdId = data.id;
  }

  const guests = parseGuests((form.get("guests") as string) ?? "");
  const { data: existing } = await supabase
    .from("guests")
    .select("id, name, position")
    .eq("household_id", householdId)
    .order("position");

  // Mantém o status já respondido de quem continua na lista.
  const keep = new Set<string>();
  for (const guest of guests) {
    const match = (existing ?? []).find((item) => item.name === guest.name);
    if (match) {
      keep.add(match.id);
      await supabase
        .from("guests")
        .update({ position: guest.position, is_child: guest.is_child })
        .eq("id", match.id);
    } else {
      const { data } = await supabase
        .from("guests")
        .insert({ ...guest, household_id: householdId })
        .select("id")
        .single();
      if (data) keep.add(data.id);
    }
  }

  const removed = (existing ?? []).filter((item) => !keep.has(item.id));
  if (removed.length > 0) {
    await supabase
      .from("guests")
      .delete()
      .in(
        "id",
        removed.map((item) => item.id),
      );
  }

  revalidatePath("/admin/convidados");
}

export async function deleteHousehold(form: FormData) {
  await requireUser();
  const id = text(form, "id");
  if (!id) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("households").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/convidados");
}

// ------------------------------------------------------------------ envios

export async function markInviteSent(householdId: string) {
  await requireUser();
  const supabase = createAdminClient();

  await supabase
    .from("households")
    .update({ invite_status: "sent", invite_sent_at: new Date().toISOString() })
    .eq("id", householdId);

  await supabase
    .from("invite_dispatches")
    .insert({ household_id: householdId, provider: "manual", status: "sent" });

  revalidatePath("/admin/convidados");
}

export async function sendInviteAutomatically(
  householdId: string,
  message: string,
  phone: string,
) {
  await requireUser();
  if (!hasCloudApi()) {
    return { ok: false as const, error: "Cloud API não configurada" };
  }

  const supabase = createAdminClient();
  const result = await sendWhatsappMessage(phone, message);

  await supabase
    .from("households")
    .update({
      invite_status: result.ok ? "sent" : "failed",
      invite_sent_at: result.ok ? new Date().toISOString() : null,
    })
    .eq("id", householdId);

  await supabase.from("invite_dispatches").insert({
    household_id: householdId,
    provider: "cloud-api",
    status: result.ok ? "sent" : "failed",
    error: result.ok ? null : result.error,
  });

  revalidatePath("/admin/convidados");
  return result;
}
