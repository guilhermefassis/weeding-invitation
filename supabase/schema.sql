-- Convite digital — schema base
-- Rode no SQL Editor do Supabase (ou via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- evento
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  couple_names text not null,
  monogram text,
  title text not null,
  blessing_line text,
  event_date timestamptz not null,
  venue_name text,
  venue_address text,
  venue_maps_url text,
  venue_lat numeric,
  venue_lng numeric,
  music_url text,
  theme jsonb not null default '{}'::jsonb,
  pix_key text,
  pix_key_owner text,
  pix_city text,
  pix_suggestions integer[] not null default '{}',
  whatsapp_template text,
  base_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --------------------------------------------------------------- páginas
-- Cada página do "livro". Ordem, conteúdo e mídia são editáveis no painel.
create table if not exists invite_pages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  position integer not null,
  kind text not null check (kind in ('cover','menu','content','gallery','rsvp','location','gift','closing')),
  is_visible boolean not null default true,
  eyebrow text,
  title text,
  subtitle text,
  body text,
  background_url text,
  background_kind text not null default 'image' check (background_kind in ('image','video','color')),
  overlay numeric not null default 0.35,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, position) deferrable initially deferred
);

create index if not exists invite_pages_event_idx on invite_pages (event_id, position);

-- ------------------------------------------------------------- convidados
-- Uma "household" é a família/grupo que recebe um link único.
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  slug text unique not null,
  family_name text not null,
  greeting text,
  phone text,
  note text,
  invite_status text not null default 'pending' check (invite_status in ('pending','sent','failed')),
  invite_sent_at timestamptz,
  opened_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists households_event_idx on households (event_id);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  is_child boolean not null default false,
  position integer not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','declined')),
  updated_at timestamptz not null default now()
);

create index if not exists guests_household_idx on guests (household_id, position);

-- --------------------------------------------------------------- presentes
create table if not exists gift_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  household_id uuid references households(id) on delete set null,
  name text,
  amount numeric(10,2),
  message text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------- envios
create table if not exists invite_dispatches (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  channel text not null default 'whatsapp',
  provider text not null default 'manual',
  status text not null default 'sent' check (status in ('sent','failed')),
  error text,
  created_at timestamptz not null default now()
);

create index if not exists invite_dispatches_household_idx on invite_dispatches (household_id, created_at desc);

-- -------------------------------------------------------------------- RLS
-- Nenhum acesso direto do browser: todo o acesso passa pelo servidor Next
-- usando a service role key (que ignora RLS). Ligar o RLS sem policies
-- deixa as tabelas fechadas para as chaves anon/publishable.
alter table events enable row level security;
alter table invite_pages enable row level security;
alter table households enable row level security;
alter table guests enable row level security;
alter table gift_messages enable row level security;
alter table invite_dispatches enable row level security;

-- ----------------------------------------------------------- updated_at
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['events','invite_pages','households','guests'] loop
    execute format('drop trigger if exists %I_touch on %I', t, t);
    execute format('create trigger %I_touch before update on %I for each row execute function touch_updated_at()', t, t);
  end loop;
end $$;
