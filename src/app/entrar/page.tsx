import { redirect } from "next/navigation";
import { hasSupabase } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function signIn(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  redirect(error ? "/entrar?erro=1" : "/admin");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="script text-4xl text-paper">Painel</h1>
        <p className="display mt-1 text-paper/60">
          Entre para editar o convite e acompanhar as confirmações.
        </p>
      </div>

      {!hasSupabase() ? (
        <p className="rounded-lg bg-amber-100 p-4 text-sm text-amber-900">
          O Supabase ainda não está configurado. Preencha o{" "}
          <code>.env.local</code> com as chaves do projeto para habilitar o
          painel.
        </p>
      ) : (
        <form action={signIn} className="flex flex-col gap-3">
          <input
            className="field w-full"
            type="email"
            name="email"
            placeholder="E-mail"
            autoComplete="email"
            required
          />
          <input
            className="field w-full"
            type="password"
            name="password"
            placeholder="Senha"
            autoComplete="current-password"
            required
          />
          {erro && (
            <p className="text-sm text-red-300">E-mail ou senha incorretos.</p>
          )}
          <button className="btn btn-primary mt-2" type="submit">
            Entrar
          </button>
        </form>
      )}
    </main>
  );
}
