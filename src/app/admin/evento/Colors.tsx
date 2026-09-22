"use client";

import { useState } from "react";
import { contrastRatio, contrastVerdict, parseColor } from "@/lib/contrast";
import type { Theme } from "@/lib/types";

type Campo = { name: keyof Theme & string; label: string; fallback: string };

const AVISOS = {
  bom: { classe: "text-emerald-700", texto: "boa leitura" },
  limite: { classe: "text-amber-700", texto: "no limite" },
  ruim: { classe: "text-red-700", texto: "difícil de ler" },
} as const;

/** O mesmo escurecimento que o CSS faz no destaque antes de usá-lo em texto. */
function comoTexto(cor: string): string {
  const rgb = parseColor(cor);
  if (!rgb) return cor;
  const [r, g, b] = rgb.map((canal) => Math.round(canal * 0.75));
  return `rgb(${r}, ${g}, ${b})`;
}

function Contraste({
  label,
  frente,
  fundo,
}: {
  label: string;
  frente: string;
  fundo: string;
}) {
  const razao = contrastRatio(frente, fundo);
  if (razao === null) return null;

  const aviso = AVISOS[contrastVerdict(razao)];

  return (
    <li className="flex items-center gap-2">
      <span
        className="inline-grid h-8 w-8 shrink-0 place-items-center rounded border border-zinc-200 text-xs"
        style={{ background: fundo, color: frente }}
      >
        Aa
      </span>
      <span className="text-zinc-500">{label}</span>
      <span className="tabular-nums text-zinc-400">{razao.toFixed(1)}:1</span>
      <span className={aviso.classe}>{aviso.texto}</span>
    </li>
  );
}

export function Colors({ theme, campos }: { theme: Theme; campos: Campo[] }) {
  const [cores, setCores] = useState<Record<string, string>>(
    Object.fromEntries(
      campos.map((campo) => [
        campo.name,
        (theme[campo.name] as string | undefined) ?? campo.fallback,
      ]),
    ),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {campos.map((campo) => (
          <label key={campo.name} className="flex flex-col gap-1">
            <span className="text-xs tracking-wide text-zinc-500 uppercase">
              {campo.label}
            </span>
            <span className="flex items-center gap-2">
              <input
                type="color"
                name={`theme_${campo.name}`}
                value={cores[campo.name]}
                onChange={(event) =>
                  setCores((atual) => ({
                    ...atual,
                    [campo.name]: event.target.value,
                  }))
                }
                className="h-9 w-14 cursor-pointer rounded border border-zinc-300 bg-white"
              />
              <code className="text-xs text-zinc-400">{cores[campo.name]}</code>
            </span>
          </label>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs tracking-wide text-zinc-500 uppercase">
          Leitura no papel
        </p>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          <Contraste
            label="Texto"
            frente={cores.ink}
            fundo={cores.paper}
          />
          <Contraste
            label="Texto suave"
            frente={cores.ink_soft}
            fundo={cores.paper}
          />
          <Contraste
            label="Destaque em texto"
            frente={comoTexto(cores.accent)}
            fundo={cores.paper}
          />
        </ul>
        <p className="mt-3 text-xs text-zinc-400">
          4,5:1 é o mínimo para texto corrido ser legível no celular, ao sol.
          O destaque aparece aqui já escurecido: no convite, o tom cheio fica
          só nos filetes e ornamentos, onde não precisa ser lido.
        </p>
      </div>
    </div>
  );
}
