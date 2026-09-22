const BUCKET = "convite";

/**
 * Caminho do arquivo dentro do bucket, extraído da URL pública do Storage.
 * Necessário para apagar: a API de remoção fala em caminho, não em URL.
 */
export function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;

  const path = url.slice(index + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}
