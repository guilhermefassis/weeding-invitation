/**
 * Contraste de cor pela fórmula do WCAG 2. Serve para o painel avisar quando
 * uma combinação escolhida vai ficar ilegível no celular, em vez de a pessoa
 * só descobrir depois de enviar o convite.
 */

/** #rgb, #rrggbb ou rgb(r g b) -> [0-255, 0-255, 0-255]. Null se não der. */
export function parseColor(value: string): [number, number, number] | null {
  const texto = value.trim();

  const curto = texto.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (curto) {
    const [, r, g, b] = curto;
    return [
      Number.parseInt(r + r, 16),
      Number.parseInt(g + g, 16),
      Number.parseInt(b + b, 16),
    ];
  }

  const longo = texto.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (longo) {
    return [
      Number.parseInt(longo[1], 16),
      Number.parseInt(longo[2], 16),
      Number.parseInt(longo[3], 16),
    ];
  }

  const funcional = texto.match(
    /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i,
  );
  if (funcional) {
    const canais = [funcional[1], funcional[2], funcional[3]].map(Number);
    if (canais.every((canal) => canal >= 0 && canal <= 255)) {
      return canais as [number, number, number];
    }
  }

  return null;
}

/** Luminância relativa, com a correção de gama do sRGB. */
export function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rl, gl, bl] = [r, g, b].map((canal) => {
    const s = canal / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** Razão de contraste entre duas cores: 1 (igual) a 21 (preto no branco). */
export function contrastRatio(frente: string, fundo: string): number | null {
  const a = parseColor(frente);
  const b = parseColor(fundo);
  if (!a || !b) return null;

  const [claro, escuro] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (claro + 0.05) / (escuro + 0.05);
}

export type ContrastVerdict = "bom" | "limite" | "ruim";

/**
 * O corte de 4,5 é o mínimo do WCAG AA para texto corrido. Entre 3 e 4,5 o
 * texto ainda passa se for grande, então vale como aviso e não como erro.
 */
export function contrastVerdict(ratio: number): ContrastVerdict {
  if (ratio >= 4.5) return "bom";
  if (ratio >= 3) return "limite";
  return "ruim";
}
