"use client";

import { useState } from "react";

type Props = {
  /** Iniciais gravadas no lacre. */
  monogram: string;
  /** Nome que aparece na etiqueta, normalmente a saudação da família. */
  recipient: string | null;
  /** Arte personalizada, quando houver. */
  image?: string | null;
  /** "arte" tira a aba e o relevo e deixa a imagem falar sozinha. */
  mode?: "fundo" | "arte";
  /** Escurecimento sobre a imagem, de 0 a 1. */
  overlay?: number;
  onOpen: () => void;
};

const OPEN_MS = 900;

export function Envelope({
  monogram,
  recipient,
  image,
  mode = "fundo",
  overlay = 0.35,
  onOpen,
}: Props) {
  const [opening, setOpening] = useState(false);

  function open() {
    if (opening) return;
    setOpening(true);
    setTimeout(onOpen, OPEN_MS);
  }

  return (
    <button
      type="button"
      className="envelope"
      data-opening={opening || undefined}
      data-arte={(image && mode === "arte") || undefined}
      onClick={open}
      aria-label="Abrir o convite"
    >
      {image && (
        <>
          {/* A arte vem do Storage, fora do otimizador do next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="envelope-bg" src={image} alt="" />
          <span
            className="envelope-veil"
            style={{ opacity: overlay }}
            aria-hidden="true"
          />
        </>
      )}

      <span className="envelope-flap" aria-hidden="true" />

      {monogram && (
        <span className="envelope-emboss" aria-hidden="true">
          {monogram}
        </span>
      )}

      <span className="envelope-hint" aria-hidden="true">
        <svg viewBox="0 0 360 140">
          <path id="arco" d="M12 132 A 172 172 0 0 1 348 132" fill="none" />
          <text>
            <textPath href="#arco" startOffset="50%" textAnchor="middle">
              Toque para abrir
            </textPath>
          </text>
        </svg>
      </span>

      {recipient && <span className="envelope-tag">{recipient}</span>}

      {monogram && (
        <span className="envelope-seal" aria-hidden="true">
          <span className="envelope-seal-face">
            <span className="script">{monogram}</span>
          </span>
        </span>
      )}
    </button>
  );
}
