type OrnamentProps = {
  className?: string;
};

/**
 * Ramo de oliveira: folhas alternadas ao longo de um caule que se afina.
 * Traço fino e desenho assimétrico — simetria perfeita é o que faz um
 * ornamento parecer clipart.
 */
export function Ornament({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 170 170" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M14 158C22 108 48 62 96 30" strokeWidth="0.9" opacity="0.8" />
        <path d="M31 122c12 3 23-1 30-11" strokeWidth="0.7" opacity="0.55" />
        <path d="M49 92c12 4 24 0 31-10" strokeWidth="0.7" opacity="0.55" />
        <path d="M71 64c11 5 23 2 31-7" strokeWidth="0.7" opacity="0.55" />
      </g>

      <g fill="currentColor">
        {[
          { x: 26, y: 140, rx: 8.5, ry: 3.1, r: -34, o: 0.38 },
          { x: 42, y: 132, rx: 7.2, ry: 2.7, r: 18, o: 0.26 },
          { x: 44, y: 112, rx: 9.2, ry: 3.3, r: -28, o: 0.4 },
          { x: 61, y: 106, rx: 7.6, ry: 2.8, r: 22, o: 0.26 },
          { x: 62, y: 84, rx: 9.4, ry: 3.4, r: -22, o: 0.4 },
          { x: 79, y: 79, rx: 7.8, ry: 2.9, r: 26, o: 0.26 },
          { x: 84, y: 56, rx: 9, ry: 3.2, r: -16, o: 0.38 },
          { x: 99, y: 49, rx: 7.4, ry: 2.7, r: 30, o: 0.24 },
          { x: 104, y: 34, rx: 7.8, ry: 2.8, r: -10, o: 0.32 },
        ].map((leaf, index) => (
          <ellipse
            key={index}
            cx={leaf.x}
            cy={leaf.y}
            rx={leaf.rx}
            ry={leaf.ry}
            opacity={leaf.o}
            transform={`rotate(${leaf.r} ${leaf.x} ${leaf.y})`}
          />
        ))}
      </g>

      <g fill="currentColor" opacity="0.3">
        <circle cx="53" cy="121" r="2.1" />
        <circle cx="72" cy="94" r="1.7" />
        <circle cx="93" cy="66" r="1.4" />
      </g>
    </svg>
  );
}

/**
 * Monograma: iniciais entre dois filetes, com um par de folhas embaixo.
 * O anel duplo genérico dava ar de selo de certificado.
 */
export function Monogram({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 160 96" width="100%" height="100%">
        <g stroke="currentColor" strokeWidth="0.7" strokeLinecap="round">
          <line x1="8" y1="40" x2="48" y2="40" opacity="0.5" />
          <line x1="112" y1="40" x2="152" y2="40" opacity="0.5" />
        </g>

        <text
          x="80"
          y="42"
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          className="script"
          fontSize="52"
        >
          {text}
        </text>
      </svg>
    </span>
  );
}
