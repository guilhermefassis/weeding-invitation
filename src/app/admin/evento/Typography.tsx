"use client";

import { useState } from "react";
import { DEFAULT_FONT_PAIR, FONT_PAIRS, TEXT_FONTS } from "@/lib/fonts";
import type { Theme } from "@/lib/types";

const PESOS = [
  { valor: 300, label: "Leve" },
  { valor: 400, label: "Normal" },
  { valor: 500, label: "Forte" },
] as const;

export function Typography({
  theme,
  couple,
}: {
  theme: Theme;
  couple: string;
}) {
  const [par, setPar] = useState(
    theme.font_pair && theme.font_pair in FONT_PAIRS
      ? theme.font_pair
      : DEFAULT_FONT_PAIR,
  );
  const [fonteTexto, setFonteTexto] = useState(
    theme.font_text && theme.font_text in TEXT_FONTS ? theme.font_text : "",
  );
  const [escala, setEscala] = useState(theme.font_scale ?? 1);
  const [peso, setPeso] = useState(theme.text_weight ?? 400);

  const fontes = FONT_PAIRS[par];
  const nomes = couple || "Guilherme & Fernanda";
  const familiaTexto = fonteTexto
    ? TEXT_FONTS[fonteTexto].family
    : fontes.text;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(FONT_PAIRS).map(([chave, opcao]) => (
          <label
            key={chave}
            className={`flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition ${
              chave === par
                ? "border-zinc-900 bg-white ring-1 ring-zinc-900"
                : "border-zinc-200 bg-white hover:border-zinc-400"
            }`}
          >
            <input
              type="radio"
              name="theme_font_pair"
              value={chave}
              checked={chave === par}
              onChange={() => setPar(chave)}
              className="sr-only"
            />
            <span
              className="truncate text-2xl leading-tight text-zinc-900"
              style={{ fontFamily: opcao.display }}
            >
              {nomes}
            </span>
            <span
              className="text-[0.7rem] tracking-[0.22em] text-zinc-500 uppercase"
              style={{ fontFamily: opcao.text }}
            >
              {opcao.label}
            </span>
            <span className="text-[11px] text-zinc-400">{opcao.hint}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="flex flex-1 flex-col gap-5">
          <label className="flex flex-col gap-1">
            <span className="text-xs tracking-wide text-zinc-500 uppercase">
              Fonte do texto corrido
            </span>
            <select
              name="theme_font_text"
              value={fonteTexto}
              onChange={(event) => setFonteTexto(event.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">A do estilo escolhido</option>
              {Object.entries(TEXT_FONTS).map(([chave, fonte]) => (
                <option key={chave} value={chave}>
                  {fonte.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-zinc-400">
              Troca só o corpo do texto e mantém os nomes do estilo acima.
            </span>
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-xs tracking-wide text-zinc-500 uppercase">
              Peso do texto
            </span>
            <div className="flex gap-2">
              {PESOS.map((opcao) => (
                <label
                  key={opcao.valor}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                    opcao.valor === peso
                      ? "border-zinc-900 bg-white ring-1 ring-zinc-900"
                      : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                  style={{ fontFamily: familiaTexto, fontWeight: opcao.valor }}
                >
                  <input
                    type="radio"
                    name="theme_text_weight"
                    value={opcao.valor}
                    checked={opcao.valor === peso}
                    onChange={() => setPeso(opcao.valor)}
                    className="sr-only"
                  />
                  {opcao.label}
                </label>
              ))}
            </div>
            <span className="text-xs text-zinc-400">
              O caminho mais curto quando o texto está apagado demais.
            </span>
          </div>

          <label className="flex flex-col gap-1">
            <span className="flex items-baseline justify-between">
              <span className="text-xs tracking-wide text-zinc-500 uppercase">
                Tamanho do texto
              </span>
              <span className="text-xs tabular-nums text-zinc-400">
                {Math.round(escala * 100)}%
              </span>
            </span>
            <input
              type="range"
              name="theme_font_scale"
              min="0.85"
              max="1.25"
              step="0.05"
              value={escala}
              onChange={(event) => setEscala(Number(event.target.value))}
            />
            <span className="text-xs text-zinc-400">
              Vale para o convite inteiro — texto e espaçamento crescem juntos,
              então a página continua equilibrada em vez de ficar apertada.
            </span>
          </label>
        </div>

        <div className="flex w-full flex-col items-center gap-2 sm:w-72">
          <div
            className="flex w-full flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-[var(--previa-papel)] px-4 py-6 text-center"
            style={
              {
                fontSize: `${escala}rem`,
                fontFamily: familiaTexto,
                fontWeight: peso,
                "--previa-papel": theme.paper ?? "#f2efe7",
                color: theme.ink ?? "#22302a",
              } as React.CSSProperties
            }
            aria-hidden="true"
          >
            <span
              className="text-[0.62em] tracking-[0.3em] uppercase"
              style={{ color: theme.accent ?? "#9a8550" }}
            >
              Bodas de trigo
            </span>
            <span
              className="text-[2em] leading-none"
              style={{ fontFamily: fontes.display, fontWeight: 400 }}
            >
              {nomes}
            </span>
            <span
              className="text-[0.8em]"
              style={{ color: theme.ink_soft ?? "#46564c" }}
            >
              sábado, às 19h00 · Casa das Oliveiras
            </span>
          </div>
          <span className="text-xs text-zinc-400">
            prévia com as cores salvas
          </span>
        </div>
      </div>
    </div>
  );
}
