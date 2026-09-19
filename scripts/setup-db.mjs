/**
 * Prepara o Supabase do zero: tabelas, conteúdo inicial, bucket de mídia e o
 * usuário do painel. Idempotente — rodar de novo não duplica nada.
 *
 *   npm run db:setup -- --email voce@exemplo.com --senha suasenha
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const pg = await import("pg").then(
  (module) => module.default,
  () => {
    console.error("Falta a dependência 'pg'. Rode `npm install` e tente de novo.");
    process.exit(1);
  },
);

// ------------------------------------------------------------------ config

async function loadEnv() {
  try {
    const raw = await readFile(join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!match) continue;
      const value = match[2].trim().replace(/^["']|["']$/g, "").replace(/\s+#.*$/, "");
      if (!process.env[match[1]]) process.env[match[1]] = value;
    }
  } catch {
    // Sem .env.local: as variáveis podem vir do ambiente.
  }
}

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : undefined;
}

function projectRef(url) {
  return new URL(url).hostname.split(".")[0];
}

function databaseUrl() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;

  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) return null;

  const ref = projectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

// ------------------------------------------------------------------- passos

async function runSql(client, file) {
  const sql = await readFile(join(root, "supabase", file), "utf8");
  await client.query(sql);
}

async function createBucket(client) {
  await client.query(`
    insert into storage.buckets (id, name, public)
    values ('convite', 'convite', true)
    on conflict (id) do update set public = true
  `);
}

async function createAdminUser(email, password) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`,
    {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, email_confirm: true }),
    },
  );

  if (response.ok) return "criado";

  const body = await response.json().catch(() => ({}));
  const message = body.msg ?? body.message ?? body.error_description ?? "";
  if (/already been registered|already exists/i.test(message)) return "já existia";

  throw new Error(message || `HTTP ${response.status}`);
}

// -------------------------------------------------------------------- fluxo

const steps = [];

function report(label, status, detail) {
  const mark = status === "ok" ? "✓" : status === "aviso" ? "!" : "✗";
  steps.push(status);
  console.log(`${mark} ${label}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  await loadEnv();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("Falta NEXT_PUBLIC_SUPABASE_URL no .env.local.");
    process.exit(1);
  }

  const connectionString = databaseUrl();
  if (!connectionString) {
    console.error(
      "Falta a senha do banco. Adicione ao .env.local uma das duas linhas:\n" +
        "  SUPABASE_DB_PASSWORD=sua-senha\n" +
        "  SUPABASE_DB_URL=postgresql://...   (Connection string do painel)",
    );
    process.exit(1);
  }

  const local = /localhost|127\.0\.0\.1/.test(connectionString);
  const client = new pg.Client({
    connectionString,
    ssl: local ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
  } catch (error) {
    console.error(`✗ Não consegui conectar no banco: ${error.message}`);
    console.error(
      "\nSe o erro for de rede (ENETUNREACH/ETIMEDOUT), sua conexão é IPv4 e o\n" +
        "Supabase só expõe IPv6 no acesso direto. Pegue a string do pooler em\n" +
        "Settings > Database > Connection string > Transaction pooler e ponha em\n" +
        "SUPABASE_DB_URL no .env.local.",
    );
    process.exit(1);
  }

  try {
    await runSql(client, "schema.sql");
    report("Tabelas criadas", "ok");

    await runSql(client, "seed.sql");
    const { rows } = await client.query(
      "select count(*)::int as total from invite_pages",
    );
    report("Conteúdo inicial", "ok", `${rows[0].total} páginas`);

    try {
      await createBucket(client);
      report("Bucket de mídia 'convite'", "ok", "público");
    } catch (error) {
      report("Bucket de mídia", "aviso", `crie à mão no Storage (${error.message})`);
    }
  } finally {
    await client.end();
  }

  const email = arg("email");
  const password = arg("senha") ?? arg("password");

  if (!email || !password) {
    report(
      "Usuário do painel",
      "aviso",
      "pulado; rode com --email voce@exemplo.com --senha suasenha",
    );
  } else if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    report("Usuário do painel", "aviso", "falta SUPABASE_SERVICE_ROLE_KEY");
  } else {
    try {
      const status = await createAdminUser(email, password);
      report("Usuário do painel", "ok", `${email} ${status}`);
    } catch (error) {
      report("Usuário do painel", "erro", error.message);
    }
  }

  console.log(
    steps.includes("erro")
      ? "\nTerminou com erros — veja as linhas marcadas com ✗."
      : "\nPronto. Rode `npm run dev` e entre em /entrar.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
