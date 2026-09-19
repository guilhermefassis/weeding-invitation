type OrnamentProps = {
  className?: string;
  flip?: boolean;
};

/** Ramo botânico em linha — usado nos cantos das páginas de papel. */
export function Ornament({ className, flip }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.75"
      >
        <path d="M8 152C8 96 34 50 82 22" />
        <path d="M24 128c14 4 28 1 38-9" />
        <path d="M38 104c15 5 30 2 40-9" />
        <path d="M56 78c14 6 29 4 40-6" />
        <path d="M76 54c13 7 28 6 39-3" />
      </g>
      <g fill="currentColor" opacity="0.32">
        <ellipse cx="30" cy="140" rx="9" ry="4.2" transform="rotate(-28 30 140)" />
        <ellipse cx="44" cy="116" rx="9.5" ry="4.4" transform="rotate(-24 44 116)" />
        <ellipse cx="62" cy="90" rx="10" ry="4.6" transform="rotate(-20 62 90)" />
        <ellipse cx="82" cy="66" rx="10" ry="4.6" transform="rotate(-16 82 66)" />
        <ellipse cx="104" cy="45" rx="9" ry="4.2" transform="rotate(-12 104 45)" />
      </g>
      <g fill="currentColor" opacity="0.5">
        <circle cx="96" cy="86" r="3.4" />
        <circle cx="112" cy="70" r="2.4" />
        <circle cx="104" cy="100" r="2" />
      </g>
    </svg>
  );
}

/** Monograma dentro de um anel fino. */
export function Monogram({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 120 120" width="100%" height="100%">
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.45"
        />
        <circle
          cx="60"
          cy="60"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.25"
        />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          className="script"
          fontSize="46"
        >
          {text}
        </text>
      </svg>
    </span>
  );
}
