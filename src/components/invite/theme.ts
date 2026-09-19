import type { CSSProperties } from "react";
import type { Theme } from "@/lib/types";

const TOKENS: Record<keyof Theme, string> = {
  accent: "--color-accent",
  paper: "--color-paper",
  ink: "--color-ink",
  envelope: "--color-envelope",
  seal: "--color-seal",
};

/** Cores do painel viram custom properties; o que não foi definido cai no CSS. */
export function themeStyle(theme: Theme): CSSProperties {
  const style: Record<string, string> = {};

  for (const [key, token] of Object.entries(TOKENS)) {
    const value = theme[key as keyof Theme];
    if (value) style[token] = value;
  }

  return style as CSSProperties;
}
