"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

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
  /** "preencher" ocupa a tela e corta; "inteira" mostra a arte sem cortar. */
  fit?: "preencher" | "inteira";
  /** Que parte da arte segurar quando o corte é inevitável. */
  focus?: "topo" | "centro" | "base";
  onOpen: () => void;
};

const OPEN_MS = 900;

const FOCO = {
  topo: "50% 0%",
  centro: "50% 50%",
  base: "50% 100%",
} as const;

export function Envelope({
  monogram,
  recipient,
  image,
  mode = "fundo",
  overlay = 0.35,
  fit = "preencher",
  focus = "centro",
  onOpen,
}: Props) {
  const [opening, setOpening] = useState(false);
  /**
   * A proporção da arte só é conhecida depois que o arquivo carrega. Até lá o
   * envelope fica no modo que preenche — sem isso, o lacre e a etiqueta
   * apareceriam numa caixa de tamanho chutado e saltariam de lugar.
   */
  const [aspecto, setAspecto] = useState<number | null>(null);
  const arte = useRef<HTMLImageElement>(null);

  /**
   * Quando a arte já está no cache, o navegador termina de carregá-la antes de
   * o React pendurar o onLoad — o evento nunca chega. Aqui a proporção é lida
   * do elemento que já está pronto.
   */
  useEffect(() => {
    const img = arte.current;
    if (img?.complete && img.naturalWidth > 0) {
      setAspecto(img.naturalWidth / img.naturalHeight);
    }
  }, [image]);

  function open() {
    if (opening) return;
    setOpening(true);
    setTimeout(onOpen, OPEN_MS);
  }

  const inteira = Boolean(image) && fit === "inteira" && aspecto !== null;

  return (
    <button
      type="button"
      className="envelope"
      data-opening={opening || undefined}
      data-arte={(image && mode === "arte") || undefined}
      data-ajuste={inteira ? "inteira" : undefined}
      onClick={open}
      aria-label="Abrir o convite"
    >
      {image && (
        // A arte vem do Storage, fora do otimizador do next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={arte}
          className="envelope-bg"
          src={image}
          alt=""
          style={{ objectPosition: FOCO[focus] }}
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (naturalWidth > 0 && naturalHeight > 0) {
              setAspecto(naturalWidth / naturalHeight);
            }
          }}
        />
      )}

      <span className="envelope-flap" aria-hidden="true" />

      {monogram && (
        <span className="envelope-emboss" aria-hidden="true">
          {monogram}
        </span>
      )}

      {/*
        O palco é a área da arte. Quando ela preenche a tela, é a tela inteira;
        quando aparece inteira, é a caixa que sobrou depois de caber. O lacre, a
        etiqueta e o "toque para abrir" moram aqui para acompanharem a arte em
        vez de flutuarem sobre a borda vazia.
      */}
      <span
        className="envelope-palco"
        style={
          aspecto ? ({ "--arte-aspecto": aspecto } as CSSProperties) : undefined
        }
      >
        {image && (
          <span
            className="envelope-veil"
            style={{ opacity: overlay }}
            aria-hidden="true"
          />
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
      </span>
    </button>
  );
}
