import { getAdminEvent, listHouseholds } from "@/lib/admin-data";
import { filterRows, guestRows, parseFilter } from "@/lib/guest-list";
import { formatDeadline, isRsvpClosed } from "@/lib/rsvp";
import { GuestTable } from "./GuestTable";

export const dynamic = "force-dynamic";

export default async function GuestListAdmin({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const event = await getAdminEvent();
  if (!event) return <p>Nenhum evento cadastrado.</p>;

  const { filtro } = await searchParams;
  const filtroAtual = parseFilter(filtro);

  const households = await listHouseholds(event.id);
  const todas = guestRows(households, event.rsvp_deadline);
  const fechado = isRsvpClosed(event.rsvp_deadline);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium">Lista de convidados</h1>
          <p className="text-sm text-zinc-500">
            {event.rsvp_deadline
              ? fechado
                ? `Confirmações encerradas em ${formatDeadline(event.rsvp_deadline)} — quem não respondeu conta como ausente.`
                : `Confirmações até ${formatDeadline(event.rsvp_deadline)}.`
              : "Sem prazo de confirmação."}
          </p>
        </div>
        <a
          href={`/admin/lista/csv?filtro=${filtroAtual}`}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-white"
        >
          Baixar planilha
        </a>
      </header>

      <GuestTable
        todas={todas}
        linhas={filterRows(todas, filtroAtual)}
        filtro={filtroAtual}
      />
    </div>
  );
}
