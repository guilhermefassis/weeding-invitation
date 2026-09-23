import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/admin", label: "Resumo" },
  { href: "/admin/convidados", label: "Convidados" },
  { href: "/admin/lista", label: "Lista" },
  { href: "/admin/paginas", label: "Páginas" },
  { href: "/admin/evento", label: "Evento" },
];

async function signOut() {
  "use server";
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
          <Link href="/admin" className="script text-2xl text-accent">
            Painel do convite
          </Link>
          <nav className="flex gap-4 text-sm">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-zinc-600 hover:text-zinc-900"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="/previa"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              Ver prévia
            </a>
          </nav>
          <form action={signOut} className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-zinc-400 sm:inline">
              {user.email}
            </span>
            <button className="text-sm text-zinc-500 hover:text-zinc-900" type="submit">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
