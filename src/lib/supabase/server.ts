import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cliente ligado à sessão do painel (Supabase Auth via cookies). */
export async function createSessionClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items) => {
          for (const { name, value, options } of items) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}
