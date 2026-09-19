import Link from "next/link";
import { getAdminEvent, listGiftMessages, listHouseholds } from "@/lib/admin-data";
import { formatBRL } from "@/lib/pix";

export default async function AdminHome() {
  const event = await getAdminEvent();

  if (!event) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-medium">Nenhum evento cadastrado</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Rode o <code>supabase/seed.sql</code> no seu projeto para criar o
          evento e as páginas iniciais.
        </p>
      </div>
    );
  }

  const [households, gifts] = await Promise.all([
    listHouseholds(event.id),
    listGiftMessages(event.id),
  ]);

  const guests = households.flatMap((household) => household.guests);
  const stats = [
    { label: "Famílias", value: households.length },
    { label: "Convidados", value: guests.length },
    {
      label: "Confirmados",
      value: guests.filter((guest) => guest.status === "confirmed").length,
    },
    {
      label: "Recusaram",
      value: guests.filter((guest) => guest.status === "declined").length,
    },
    {
      label: "Sem resposta",
      value: guests.filter((guest) => guest.status === "pending").length,
    },
    {
      label: "Convites enviados",
      value: households.filter((household) => household.invite_status === "sent")
        .length,
    },
  ];

  const notes = households.filter((household) => household.note);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-medium">{event.couple_names}</h1>
        <p className="text-sm text-zinc-500">
          {event.title} ·{" "}
          <Link className="underline" href="/admin/evento">
            editar dados do evento
          </Link>
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <p className="text-2xl font-medium">{stat.value}</p>
            <p className="text-xs tracking-wide text-zinc-500 uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Recados das famílias</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum recado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notes.map((household) => (
              <li
                key={household.id}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <p className="text-sm font-medium">{household.family_name}</p>
                <p className="mt-1 text-sm text-zinc-600">{household.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Presentes anunciados</h2>
        {gifts.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum aviso de presente ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {gifts.map((gift) => (
              <li
                key={gift.id}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <p className="text-sm font-medium">
                  {gift.name ?? "Anônimo"}
                  {gift.amount != null && (
                    <span className="ml-2 text-zinc-500">
                      {formatBRL(Number(gift.amount))}
                    </span>
                  )}
                </p>
                {gift.message && (
                  <p className="mt-1 text-sm text-zinc-600">{gift.message}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
