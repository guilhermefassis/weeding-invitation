import type { CSSProperties } from "react";
import { FONT_PAIRS } from "@/lib/fonts";
import type { Theme } from "@/lib/types";

const CORES = {
  accent: "--color-accent",
  paper: "--color-paper",
  ink: "--color-ink",
  envelope: "--color-envelope",
  seal: "--color-seal",
} as const;

const TAMANHOS = {
  seal_scale: "--seal-scale",
  monogram_scale: "--monogram-scale",
  emboss_scale: "--emboss-scale",
  /* O tamanho do texto sai do font-size da raiz, que cobre tudo que mede em
     rem. Os poucos pontos que medem em vw — os nomes na capa, a etiqueta do
     envelope — leem esta variável para crescer junto. */
  font_scale: "--font-scale",
} as const;

/** Cores e tamanhos do painel viram custom properties; o resto cai no CSS. */
export function themeStyle(theme: Theme): CSSProperties {
  const style: Record<string, string> = {};

  for (const [key, token] of Object.entries(CORES)) {
    const value = theme[key as keyof typeof CORES];
    if (value) style[token] = value;
  }

  for (const [key, token] of Object.entries(TAMANHOS)) {
    const value = theme[key as keyof typeof TAMANHOS];
    if (typeof value === "number" && Number.isFinite(value)) {
      style[token] = String(value);
    }
  }

  // Um par desconhecido (tema antigo, chave digitada errada) cai no padrão do
  // CSS em vez de deixar o convite sem fonte definida.
  const par = theme.font_pair ? FONT_PAIRS[theme.font_pair] : undefined;
  if (par) {
    style["--serif"] = par.text;
    style["--handwriting"] = par.display;
  }

  return style as CSSProperties;
}
