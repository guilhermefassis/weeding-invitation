import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "./supabase/server";
import { hasSupabase } from "./supabase/admin";

/** Garante que quem está chamando é um anfitrião logado no painel. */
export async function requireUser() {
  if (!hasSupabase()) redirect("/entrar");

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar");
  return user;
}
