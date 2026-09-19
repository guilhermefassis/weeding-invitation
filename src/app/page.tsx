import Link from "next/link";
import { isDemoMode } from "@/lib/data";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-8 px-6 py-16 text-paper">
      <div>
        <p className="eyebrow text-accent-soft">Convites digitais</p>
        <h1 className="script mt-3 text-5xl text-paper">Convite em livro</h1>
        <p className="display mt-4 text-lg leading-relaxed text-paper/70">
          Um convite por família, com página de confirmação de presença,
          localização, presente via PIX e disparo por WhatsApp.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link className="btn btn-primary" href="/convite/demo">
          Ver o convite de exemplo
        </Link>
        <Link className="btn btn-ghost" href="/admin">
          Abrir o painel
        </Link>
      </div>

      {isDemoMode() && (
        <p className="display text-sm text-paper/50">
          Modo demonstração: o Supabase ainda não está configurado, então nada é
          salvo. Preencha o <code>.env.local</code> para ligar o banco.
        </p>
      )}
    </main>
  );
}
