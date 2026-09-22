"use client";

import { useState, type CSSProperties } from "react";
import type { Theme } from "@/lib/types";

const CONTROLES = [
  { name: "seal_scale", label: "Lacre de cera", hint: "o selo inteiro" },
  {
    name: "monogram_scale",
    label: "Iniciais no lacre",
    hint: "as letras gravadas na cera",
  },
  {
    name: "emboss_scale",
    label: "Iniciais em relevo",
    hint: "as letras grandes no alto do envelope",
  },
] as const;

type Chave = (typeof CONTROLES)[number]["name"];

/**
 * A prévia é um celular em miniatura: 176px de largura para 393px de tela
 * real. Os tamanhos de referência descem na mesma proporção, senão o lacre
 * apareceria aqui maior do que fica no convite.
 */
const ESCALA = 176 / 393;

export function EnvelopeSizes({
  theme,
  monogram,
}: {
  theme: Theme;
  monogram: string | null;
}) {
  const [tamanhos, setTamanhos] = useState<Record<Chave, number>>({
    seal_scale: theme.seal_scale ?? 1,
    monogram_scale: theme.monogram_scale ?? 1,
    emboss_scale: theme.emboss_scale ?? 1,
  });

  const previa = {
    "--color-envelope": theme.envelope ?? "#223028",
    "--color-seal": theme.seal ?? "#9c8248",
    "--seal-scale": tamanhos.seal_scale,
    "--monogram-scale": tamanhos.monogram_scale,
    "--emboss-scale": tamanhos.emboss_scale,
    "--seal-base": `${Math.round(104 * ESCALA)}px`,
    "--monogram-base": `${(2.1 * ESCALA).toFixed(2)}rem`,
    "--emboss-base": `${(3.2 * ESCALA).toFixed(2)}rem`,
  } as CSSProperties;

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="flex flex-1 flex-col gap-5">
        {CONTROLES.map((controle) => (
          <label key={controle.name} className="flex flex-col gap-1">
            <span className="flex items-baseline justify-between">
              <span className="text-xs tracking-wide text-zinc-500 uppercase">
                {controle.label}
              </span>
              <span className="text-xs tabular-nums text-zinc-400">
                {Math.round(tamanhos[controle.name] * 100)}%
              </span>
            </span>
            <input
              type="range"
              name={`theme_${controle.name}`}
              min="0.5"
              max="1.8"
              step="0.05"
              value={tamanhos[controle.name]}
              onChange={(event) =>
                setTamanhos((atual) => ({
                  ...atual,
                  [controle.name]: Number(event.target.value),
                }))
              }
            />
            <span className="text-xs text-zinc-400">{controle.hint}</span>
          </label>
        ))}

        <button
          type="button"
          className="self-start text-xs text-zinc-500 underline"
          onClick={() =>
            setTamanhos({
              seal_scale: 1,
              monogram_scale: 1,
              emboss_scale: 1,
            })
          }
        >
          Voltar ao tamanho padrão
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div
          className="relative h-[380px] w-[176px] overflow-hidden rounded-xl shadow-inner"
          style={{ ...previa, pointerEvents: "none" }}
          aria-hidden="true"
        >
          <div className="envelope">
            <span className="envelope-flap" />
            <span className="envelope-emboss">{monogram || "GF"}</span>
            <span className="envelope-seal">
              <span className="envelope-seal-face">
                <span className="script">{monogram || "GF"}</span>
              </span>
            </span>
          </div>
        </div>
        <span className="text-xs text-zinc-400">prévia do envelope</span>
      </div>
    </div>
  );
}
