import { getAdminEvent, listPages } from "@/lib/admin-data";
import type { GalleryItem } from "@/lib/types";
import {
  addGalleryMedia,
  moveGalleryMedia,
  movePage,
  removeGalleryMedia,
  updatePage,
} from "../actions";

const KIND_LABELS: Record<string, string> = {
  cover: "Capa",
  menu: "Menu de ícones",
  content: "Conteúdo livre",
  gallery: "Galeria",
  rsvp: "Confirmação de presença",
  location: "Localização",
  gift: "Presente (PIX)",
  closing: "Encerramento",
};

export default async function PagesAdmin() {
  const event = await getAdminEvent();
  if (!event) return <p>Nenhum evento cadastrado.</p>;

  const pages = await listPages(event.id);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-medium">Páginas do convite</h1>
        <p className="text-sm text-zinc-500">
          A ordem aqui é a ordem em que o convidado vira as páginas.
        </p>
      </header>

      {pages.map((page, index) => {
        const gallery = (page.config.gallery ?? []) as GalleryItem[];

        return (
          <details
            key={page.id}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <summary className="flex cursor-pointer items-center gap-3 text-sm">
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                {index + 1}
              </span>
              <span className="font-medium">
                {page.title ?? page.eyebrow ?? KIND_LABELS[page.kind]}
              </span>
              <span className="text-xs text-zinc-400">{KIND_LABELS[page.kind]}</span>
              {!page.is_visible && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                  oculta
                </span>
              )}
            </summary>

            <div className="mt-4 flex gap-2">
              {(["up", "down"] as const).map((direction) => (
                <form key={direction} action={movePage}>
                  <input type="hidden" name="id" value={page.id} />
                  <input type="hidden" name="direction" value={direction} />
                  <button
                    type="submit"
                    className="rounded border border-zinc-300 px-2 py-1 text-xs"
                  >
                    {direction === "up" ? "Subir" : "Descer"}
                  </button>
                </form>
              ))}
            </div>

            <form action={updatePage} className="mt-4 flex flex-col gap-4">
              <input type="hidden" name="id" value={page.id} />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs tracking-wide text-zinc-500 uppercase">
                    Antetítulo
                  </span>
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    name="eyebrow"
                    defaultValue={page.eyebrow ?? ""}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs tracking-wide text-zinc-500 uppercase">
                    Título
                  </span>
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    name="title"
                    defaultValue={page.title ?? ""}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs tracking-wide text-zinc-500 uppercase">
                    Subtítulo
                  </span>
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    name="subtitle"
                    defaultValue={page.subtitle ?? ""}
                  />
                </label>
                <label className="flex items-center gap-2 self-end text-sm">
                  <input
                    type="checkbox"
                    name="is_visible"
                    defaultChecked={page.is_visible}
                  />
                  Página visível no convite
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs tracking-wide text-zinc-500 uppercase">
                  Texto
                </span>
                <textarea
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  name="body"
                  rows={5}
                  defaultValue={page.body ?? ""}
                />
              </label>

              <fieldset className="grid gap-4 rounded-lg bg-zinc-50 p-4 sm:grid-cols-3">
                <legend className="px-1 text-xs tracking-wide text-zinc-500 uppercase">
                  Fundo da página
                </legend>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">Tipo</span>
                  <select
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    name="background_kind"
                    defaultValue={page.background_kind}
                  >
                    <option value="color">Papel (sem mídia)</option>
                    <option value="image">Foto</option>
                    <option value="video">Vídeo</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-xs text-zinc-500">
                    Enviar foto ou vídeo
                  </span>
                  <input
                    type="file"
                    name="background_file"
                    accept="image/*,video/*"
                    className="text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-xs text-zinc-500">
                    Ou colar uma URL
                  </span>
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    name="background_url"
                    defaultValue={page.background_url ?? ""}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">
                    Escurecer ({page.overlay})
                  </span>
                  <input
                    type="range"
                    name="overlay"
                    min="0"
                    max="1"
                    step="0.05"
                    defaultValue={page.overlay}
                  />
                </label>
              </fieldset>

              <button
                type="submit"
                className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
              >
                Salvar página
              </button>
            </form>

            {page.kind === "gallery" && (
              <div className="mt-6 border-t border-zinc-200 pt-4">
                <h3 className="text-sm font-medium">
                  Galeria{" "}
                  <span className="text-xs font-normal text-zinc-400">
                    {gallery.length} {gallery.length === 1 ? "item" : "itens"} · a
                    ordem aqui é a ordem no convite
                  </span>
                </h3>

                {gallery.length > 0 && (
                  <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {gallery.map((item, itemIndex) => (
                      <li key={`${item.url}-${itemIndex}`} className="flex flex-col gap-1">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
                          {item.kind === "video" ? (
                            <video src={item.url} className="h-full w-full object-cover" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.url}
                              alt={item.caption ?? ""}
                              className="h-full w-full object-cover"
                            />
                          )}
                          {item.kind === "video" && (
                            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
                              vídeo
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-1">
                          {(["up", "down"] as const).map((direction) => (
                            <form key={direction} action={moveGalleryMedia}>
                              <input type="hidden" name="id" value={page.id} />
                              <input type="hidden" name="index" value={itemIndex} />
                              <input type="hidden" name="direction" value={direction} />
                              <button
                                type="submit"
                                className="rounded px-1.5 text-xs text-zinc-500 hover:bg-zinc-100 disabled:opacity-25"
                                disabled={
                                  direction === "up"
                                    ? itemIndex === 0
                                    : itemIndex === gallery.length - 1
                                }
                                aria-label={direction === "up" ? "Mover antes" : "Mover depois"}
                              >
                                {direction === "up" ? "←" : "→"}
                              </button>
                            </form>
                          ))}
                          <form action={removeGalleryMedia}>
                            <input type="hidden" name="id" value={page.id} />
                            <input type="hidden" name="index" value={itemIndex} />
                            <button
                              type="submit"
                              className="rounded px-1.5 text-xs text-red-600 hover:bg-red-50"
                              aria-label="Remover"
                            >
                              ✕
                            </button>
                          </form>
                        </div>

                        {item.caption && (
                          <p className="truncate text-center text-[11px] text-zinc-400">
                            {item.caption}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <form action={addGalleryMedia} className="mt-4 flex flex-wrap items-end gap-3">
                  <input type="hidden" name="id" value={page.id} />
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">
                      Fotos ou vídeos (dá para escolher vários)
                    </span>
                    <input
                      type="file"
                      name="media"
                      accept="image/*,video/*"
                      multiple
                      className="text-sm"
                    />
                  </label>
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    name="caption"
                    placeholder="Legenda (só para envio único)"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
                  >
                    Adicionar
                  </button>
                </form>
              </div>
            )}
          </details>
        );
      })}
    </div>
  );
}
