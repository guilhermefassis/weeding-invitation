import {
  Cormorant_Garamond,
  Great_Vibes,
  Italiana,
  Jost,
  Libre_Baskerville,
  Pinyon_Script,
  Playfair_Display,
  Sacramento,
} from "next/font/google";

/**
 * O par padrão é o único pré-carregado. Os outros entram com `preload: false`:
 * a declaração @font-face vai no CSS, mas o navegador só baixa o arquivo da
 * família que o tema realmente usa.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
});

export const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  preload: false,
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  preload: false,
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  preload: false,
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  preload: false,
});

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false,
});

const sacramento = Sacramento({
  subsets: ["latin"],
  weight: "400",
  preload: false,
});

export type FontPair = {
  label: string;
  /** O que o convidado vê, em uma linha. */
  hint: string;
  /** Corpo de texto, títulos em versalete, datas. */
  text: string;
  /** Nomes do casal, monograma, títulos manuscritos. */
  display: string;
};

/**
 * Tipografia vem em par, não em peça solta: a fonte dos nomes e a do texto
 * precisam ter sido desenhadas para conviver. Por isso a escolha é de
 * combinação, e não de duas listas soltas que dariam para misturar errado.
 */
export const FONT_PAIRS: Record<string, FontPair> = {
  classico: {
    label: "Clássico",
    hint: "Papelaria tradicional, manuscrito fino",
    text: cormorant.style.fontFamily,
    display: pinyon.style.fontFamily,
  },
  romantico: {
    label: "Romântico",
    hint: "Manuscrito largo e generoso",
    text: cormorant.style.fontFamily,
    display: greatVibes.style.fontFamily,
  },
  editorial: {
    label: "Editorial",
    hint: "Serifa forte com maiúsculas altas",
    text: playfair.style.fontFamily,
    display: italiana.style.fontFamily,
  },
  moderno: {
    label: "Moderno",
    hint: "Sem serifa, ar contemporâneo",
    text: jost.style.fontFamily,
    display: cormorant.style.fontFamily,
  },
  rustico: {
    label: "Rústico",
    hint: "Serifa robusta, manuscrito solto",
    text: baskerville.style.fontFamily,
    display: sacramento.style.fontFamily,
  },
};

export const DEFAULT_FONT_PAIR = "classico";

/**
 * Fonte do texto corrido, para quem quer manter os nomes de um par e trocar
 * só o corpo. Vazio = usa a do par.
 */
export const TEXT_FONTS: Record<string, { label: string; family: string }> = {
  cormorant: { label: "Cormorant", family: cormorant.style.fontFamily },
  playfair: { label: "Playfair", family: playfair.style.fontFamily },
  baskerville: { label: "Baskerville", family: baskerville.style.fontFamily },
  jost: { label: "Jost", family: jost.style.fontFamily },
};

export function fontPair(key: string | undefined): FontPair {
  return FONT_PAIRS[key ?? ""] ?? FONT_PAIRS[DEFAULT_FONT_PAIR];
}
