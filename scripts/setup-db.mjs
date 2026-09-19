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
  const configured = process.env.SUPABASE_DB_URL;
  // Um host ainda com o placeholder não serve para conectar.
  if (configured && !/REGIAO|REGION|\[YOUR-PASSWORD\]/.test(configured)) {
    return configured;
  }

  const password = dbPassword();
  if (!password) return null;

  const ref = projectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

/** A senha pode vir solta ou embutida numa connection string. */
function dbPassword() {
  if (process.env.SUPABASE_DB_PASSWORD) return process.env.SUPABASE_DB_PASSWORD;

  const url = process.env.SUPABASE_DB_URL;
  if (!url) return null;

  const match = url.match(/^postgres(?:ql)?:\/\/[^:]+:([^@]+)@/);
  const password = match ? decodeURIComponent(match[1]) : null;
  return password && password !== "[YOUR-PASSWORD]" ? password : null;
}

// Regiões onde o Supabase hospeda o pooler, na ordem em que vale tentar.
const POOLER_REGIONS = [
  "sa-east-1",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-central-1",
  "eu-central-2",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-north-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-south-1",
  "ap-northeast-1",
  "ap-northeast-2",
  "ca-central-1",
];

/**
 * O acesso direto do Supabase só tem IPv6. O pooler tem IPv4, mas o host
 * carrega a região, que não dá para deduzir do project ref — então testamos
 * os candidatos até um aceitar as credenciais.
 */
async function discoverPooler(ref, password) {
  const candidates = POOLER_REGIONS.flatMap((region) => [
    `aws-0-${region}.pooler.supabase.com`,
    `aws-1-${region}.pooler.supabase.com`,
  ]);

  const tryHost = async (host) => {
    const client = new pg.Client({
      host,
      port: 5432,
      user: `postgres.${ref}`,
      password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    });

    try {
      await client.connect();
      await client.end();
      return host;
    } catch {
      return null;
    }
  };

  for (let i = 0; i < candidates.length; i += 6) {
    const batch = candidates.slice(i, i + 6);
    const found = (await Promise.all(batch.map(tryHost))).find(Boolean);
    if (found) return found;
  }

  return null;
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
  let client = new pg.Client({
    connectionString,
    ssl: local ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
  } catch (error) {
    const unreachable = /ENETUNREACH|ETIMEDOUT|EHOSTUNREACH|ENOTFOUND/.test(
      error.message,
    );
    const password = dbPassword();

    if (!unreachable || local || !password) {
      console.error(`✗ Não consegui conectar no banco: ${error.message}`);
      process.exit(1);
    }

    const ref = projectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("… acesso direto indisponível (IPv6); procurando o pooler IPv4");

    const host = await discoverPooler(ref, password);
    if (!host) {
      console.error(
        "✗ Nenhum pooler aceitou as credenciais.\n\n" +
          "Confira a senha do banco, ou pegue a string pronta em\n" +
          `https://supabase.com/dashboard/project/${ref}/settings/database\n` +
          "(Connection string > Session pooler) e ponha em SUPABASE_DB_URL.",
      );
      process.exit(1);
    }

    const poolerUrl = `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:5432/postgres`;
    report("Pooler encontrado", "ok", host);
    console.log(
      `  Para pular essa busca na próxima vez, ponha no .env.local:\n  SUPABASE_DB_URL=${poolerUrl}\n`,
    );

    client = new pg.Client({
      connectionString: poolerUrl,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
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
