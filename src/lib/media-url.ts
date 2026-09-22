/**
 * Links de "compartilhar" do Drive e do Dropbox apontam para uma página HTML,
 * não para o arquivo — a tag <img> recebe HTML e mostra ícone quebrado.
 * Aqui traduzimos para a forma que serve o arquivo direto.
 */
export function directMediaUrl(url: string | null): string | null {
  if (!url) return null;

  const drive = url.match(
    /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]*&)*id=)([\w-]{20,})/,
  );
  if (drive) return `https://lh3.googleusercontent.com/d/${drive[1]}`;

  if (/dropbox\.com\//.test(url)) {
    return url.replace(/[?&]dl=\d/, "").replace(/\?raw=1$/, "") + "?raw=1";
  }

  return url;
}
