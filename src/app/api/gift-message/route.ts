import { NextResponse } from "next/server";
import { z } from "zod";
import { saveGiftMessage } from "@/lib/data";

const schema = z.object({
  eventId: z.string().min(1),
  householdSlug: z.string().nullable().optional(),
  name: z.string().max(120).nullable().optional(),
  amount: z.number().positive().max(1_000_000).nullable().optional(),
  message: z.string().max(600).nullable().optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const result = await saveGiftMessage(parsed.data);
  return NextResponse.json({ ok: true, ...result });
}
