import Link from "next/link";
import {
  countRows,
  statusLabel,
  type GuestRow,
  type ListFilter,
} from "@/lib/guest-list";

const FILTROS: { chave: ListFilter; label: string }[] = [
  { chave: "todos", label: "Todos" },
  { chave: "confirmados", label: "Vão" },
  { chave: "recusados", label: "Não vão" },
  { chave: "sem-resposta", label: "Sem resposta" },
];

const CORES: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  declined: "bg-red-100 text-red-800",
  pending: "bg-zinc-100 text-zinc-600",
};

export function GuestTable({
  todas,
  linhas,
  filtro,
}: {
  /** Todas as pessoas, para os contadores dos filtros. */
  todas: GuestRow[];
  /** Só as que passam pelo filtro atual. */
  linhas: GuestRow[];
  filtro: ListFilter;
}) {
  const contagem = countRows(todas);

  return (
    <>
      <nav className="flex flex-wrap gap-2">
        {FILTROS.map((opcao) => {
          const ativo = opcao.chave === filtro;
          return (
            <Link
              key={opcao.chave}
              href={`/admin/lista?filtro=${opcao.chave}`}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                ativo
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {opcao.label}
              <span
                className={`ml-2 tabular-nums ${
                  ativo ? "text-white/70" : "text-zinc-400"
                }`}
              >
                {contagem[opcao.chave]}
              </span>
            </Link>
          );
        })}
      </nav>

      {linhas.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
          {contagem.todos === 0 ? (
            <>
              Nenhum convidado cadastrado ainda — comece pelas famílias em{" "}
              <Link className="underline" href="/admin/convidados">
                Convidados
              </Link>
              .
            </>
          ) : (
            "Ninguém nesta situação."
          )}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-xs tracking-wide text-zinc-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-normal">Convidado</th>
                <th className="hidden px-4 py-3 font-normal sm:table-cell">
                  Família
                </th>
                <th className="px-4 py-3 font-normal">Situação</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => (
                <tr
                  key={linha.id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    {linha.name}
                    {linha.isChild && (
                      <span className="ml-2 text-xs text-zinc-400">criança</span>
                    )}
                    <span className="block text-xs text-zinc-400 sm:hidden">
                      {linha.family}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-500 sm:table-cell">
                    {linha.family}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs whitespace-nowrap ${CORES[linha.status]}`}
                    >
                      {statusLabel(linha)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
