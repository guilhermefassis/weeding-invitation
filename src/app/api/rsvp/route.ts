import { NextResponse } from "next/server";
import { z } from "zod";
import { saveRsvp } from "@/lib/data";

const schema = z.object({
  householdSlug: z.string().min(1),
  note: z.string().max(600).optional(),
  answers: z
    .array(
      z.object({
        guestId: z.string().min(1),
        status: z.enum(["pending", "confirmed", "declined"]),
      }),
    )
    .max(30),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const result = await saveRsvp(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { error: "O prazo de confirmação já encerrou." },
      { status: 409 },
    );
  }

  return NextResponse.json(result);
}
