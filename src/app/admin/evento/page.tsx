import { getAdminEvent } from "@/lib/admin-data";
import { DEFAULT_WHATSAPP_TEMPLATE } from "@/lib/whatsapp";
import { updateEvent } from "../actions";

/** ISO -> valor aceito pelo input datetime-local, no fuso de São Paulo. */
function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
  return parts.replace(" ", "T");
}

/** ISO -> valor aceito pelo input date, no fuso de São Paulo. */
function toDateInput(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
  }).format(new Date(iso));
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs tracking-wide text-zinc-500 uppercase">{label}</span>
      <input
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        step={type === "number" ? "any" : undefined}
      />
      {hint && <span className="text-xs text-zinc-400">{hint}</span>}
    </label>
  );
}

export default async function EventPage() {
  const event = await getAdminEvent();
  if (!event) return <p>Nenhum evento cadastrado.</p>;

  return (
    <form action={updateEvent} className="flex flex-col gap-8">
      <input type="hidden" name="id" value={event.id} />

      <section className="flex flex-col gap-4">
        <h1 className="text-xl font-medium">Dados do evento</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nomes do casal" name="couple_names" defaultValue={event.couple_names} />
          <Field label="Monograma" name="monogram" defaultValue={event.monogram} hint="Duas letras, ex: GM" />
          <Field label="Título" name="title" defaultValue={event.title} />
          <Field label="Linha de abertura" name="blessing_line" defaultValue={event.blessing_line} />
          <Field
            label="Data e hora"
            name="event_date"
            type="datetime-local"
            defaultValue={toLocalInput(event.event_date)}
          />
          <Field
            label="Prazo de confirmação"
            name="rsvp_deadline"
            type="date"
            defaultValue={event.rsvp_deadline ? toDateInput(event.rsvp_deadline) : ""}
            hint="Depois desta data quem não respondeu conta como ausente"
          />
          <Field label="Música de fundo (URL)" name="music_url" defaultValue={event.music_url} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Local</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do local" name="venue_name" defaultValue={event.venue_name} />
          <Field label="Endereço" name="venue_address" defaultValue={event.venue_address} />
          <Field label="Link do Google Maps" name="venue_maps_url" defaultValue={event.venue_maps_url} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" name="venue_lat" type="number" defaultValue={event.venue_lat} />
            <Field label="Longitude" name="venue_lng" type="number" defaultValue={event.venue_lng} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">PIX</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Chave PIX" name="pix_key" defaultValue={event.pix_key} />
          <Field label="Nome do recebedor" name="pix_key_owner" defaultValue={event.pix_key_owner} hint="Como está no banco, até 25 caracteres" />
          <Field label="Cidade do recebedor" name="pix_city" defaultValue={event.pix_city} />
          <Field
            label="Valores sugeridos"
            name="pix_suggestions"
            defaultValue={event.pix_suggestions.join(", ")}
            hint="Separados por vírgula"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Disparo por WhatsApp</h2>
        <Field
          label="Endereço do site"
          name="base_url"
          defaultValue={event.base_url}
          hint="Usado para montar o link de cada família, ex: https://convite.seudominio.com"
        />
        <label className="flex flex-col gap-1">
          <span className="text-xs tracking-wide text-zinc-500 uppercase">
            Mensagem do convite
          </span>
          <textarea
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm"
            name="whatsapp_template"
            rows={9}
            defaultValue={event.whatsapp_template ?? DEFAULT_WHATSAPP_TEMPLATE}
          />
          <span className="text-xs text-zinc-400">
            Variáveis: {"{saudacao} {familia} {casal} {titulo} {data} {hora} {local} {link}"}
          </span>
        </label>
      </section>

      <button
        type="submit"
        className="self-start rounded-lg bg-zinc-900 px-5 py-2.5 text-sm text-white"
      >
        Salvar
      </button>
    </form>
  );
}
