/**
 * `next/font/google` só existe dentro do compilador do Next: fora dele os
 * imports viram funções inexistentes. Nos testes este duplo devolve o mesmo
 * formato que o Next produz — é o `style.fontFamily` que o tema consome.
 */
type Opcoes = {
  weight?: string | string[];
  subsets?: string[];
  variable?: string;
  preload?: boolean;
};

function familia(nome: string) {
  return (opcoes: Opcoes = {}) => ({
    className: "",
    variable: opcoes.variable ?? "",
    style: { fontFamily: `"${nome}", "${nome} Fallback"` },
  });
}

export const Cormorant_Garamond = familia("Cormorant Garamond");
export const Great_Vibes = familia("Great Vibes");
export const Italiana = familia("Italiana");
export const Jost = familia("Jost");
export const Libre_Baskerville = familia("Libre Baskerville");
export const Pinyon_Script = familia("Pinyon Script");
export const Playfair_Display = familia("Playfair Display");
export const Sacramento = familia("Sacramento");
