"use client";

import { useState } from "react";
import { DEFAULT_FONT_PAIR, FONT_PAIRS } from "@/lib/fonts";
import type { Theme } from "@/lib/types";

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
  const [escala, setEscala] = useState(theme.font_scale ?? 1);

  const fontes = FONT_PAIRS[par];
  const nomes = couple || "Guilherme & Fernanda";

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
        <label className="flex flex-1 flex-col gap-1">
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

        <div className="flex w-full flex-col items-center gap-2 sm:w-64">
          <div
            className="flex w-full flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-[#f2efe7] px-4 py-6 text-center text-[#22302a]"
            style={{ fontSize: `${escala}rem` }}
            aria-hidden="true"
          >
            <span
              className="text-[0.62em] tracking-[0.3em] text-[#9a8550] uppercase"
              style={{ fontFamily: fontes.text }}
            >
              Bodas de trigo
            </span>
            <span
              className="text-[2em] leading-none"
              style={{ fontFamily: fontes.display }}
            >
              {nomes}
            </span>
            <span
              className="text-[0.8em] text-[#5d6b62]"
              style={{ fontFamily: fontes.text }}
            >
              sábado, às 19h00
            </span>
          </div>
          <span className="text-xs text-zinc-400">prévia da tipografia</span>
        </div>
      </div>
    </div>
  );
}
