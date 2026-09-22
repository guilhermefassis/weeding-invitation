import type { CSSProperties } from "react";
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

  return style as CSSProperties;
}
