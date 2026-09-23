import { NextResponse } from "next/server";
import { getAdminEvent, listHouseholds } from "@/lib/admin-data";
import { requireUser } from "@/lib/auth";
import {
  filterRows,
  guestListCsv,
  guestRows,
  parseFilter,
} from "@/lib/guest-list";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await requireUser();

  const event = await getAdminEvent();
  if (!event) return new NextResponse("Nenhum evento cadastrado", { status: 404 });

  const filtro = parseFilter(
    new URL(request.url).searchParams.get("filtro") ?? undefined,
  );
  const households = await listHouseholds(event.id);
  const linhas = filterRows(guestRows(households, event.rsvp_deadline), filtro);

  // O BOM é o que faz o Excel abrir os acentos certos em vez de "JosÃ©".
  return new NextResponse(`﻿${guestListCsv(linhas)}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="convidados-${filtro}.csv"`,
    },
  });
}
