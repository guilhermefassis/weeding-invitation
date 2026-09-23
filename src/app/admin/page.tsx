import Link from "next/link";
import { getAdminEvent, listGiftMessages, listHouseholds } from "@/lib/admin-data";
import { formatBRL } from "@/lib/pix";
import { countGuests, formatDeadline, isRsvpClosed } from "@/lib/rsvp";

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
  const closed = isRsvpClosed(event.rsvp_deadline);
  const counts = countGuests(guests, event.rsvp_deadline);

  const stats = [
    { label: "Famílias", value: households.length, href: "/admin/convidados" },
    { label: "Convidados", value: counts.total, href: "/admin/lista" },
    {
      label: "Confirmados",
      value: counts.confirmed,
      href: "/admin/lista?filtro=confirmados",
    },
    {
      label: closed ? "Não vão (inclui sem resposta)" : "Recusaram",
      value: counts.declined,
      href: "/admin/lista?filtro=recusados",
    },
    {
      label: closed ? "Não responderam a tempo" : "Sem resposta",
      value: counts.silent,
      href: "/admin/lista?filtro=sem-resposta",
    },
    {
      label: "Convites enviados",
      value: households.filter((household) => household.invite_status === "sent")
        .length,
      href: "/admin/convidados",
    },
  ];

  const notes = households.filter((household) => household.note);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-medium">{event.couple_names}</h1>
        <p className="text-sm text-zinc-500">
          {event.title} ·{" "}
          {event.rsvp_deadline
            ? closed
              ? `confirmações encerradas em ${formatDeadline(event.rsvp_deadline)}`
              : `confirmações até ${formatDeadline(event.rsvp_deadline)}`
            : "sem prazo de confirmação"}{" "}
          ·{" "}
          <Link className="underline" href="/admin/evento">
            editar dados do evento
          </Link>
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400"
          >
            <p className="text-2xl font-medium">{stat.value}</p>
            <p className="text-xs tracking-wide text-zinc-500 uppercase">
              {stat.label}
            </p>
          </Link>
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
