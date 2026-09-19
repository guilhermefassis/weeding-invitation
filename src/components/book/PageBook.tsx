"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type BookApi = {
  current: number;
  total: number;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
};

const BookContext = createContext<BookApi | null>(null);

export function useBook(): BookApi {
  const api = useContext(BookContext);
  if (!api) throw new Error("useBook precisa estar dentro de <PageBook>.");
  return api;
}

const DRAG_THRESHOLD = 0.28;
/** Mesma duração da transição em .leaf (globals.css). */
const FLIP_MS = 950;

function isInteractive(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest("button, a, input, textarea, select, [data-no-drag]"))
  );
}

export function PageBook({ children }: { children: ReactNode[] }) {
  const leaves = children.filter(Boolean);
  const total = leaves.length;

  const [current, setCurrent] = useState(0);
  /** -1..1 — progresso do arraste: negativo vira para frente, positivo volta. */
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ id: number; x: number; y: number; axis: "?" | "x" | "y" } | null>(null);

  /** Folha que está virando para frente e precisa ficar por cima até parar. */
  const [flipping, setFlipping] = useState<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(total - 1, index));
      setDrag(0);
      if (target > current) setFlipping(current);
      setCurrent(target);
    },
    [current, total],
  );

  useEffect(() => {
    if (flipping === null) return;
    const timer = setTimeout(() => setFlipping(null), FLIP_MS + 30);
    return () => clearTimeout(timer);
  }, [flipping]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isInteractive(event.target)) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, axis: "?" };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (start.axis === "?") {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      start.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (start.axis === "x") {
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    if (start.axis !== "x") return;

    const width = containerRef.current?.clientWidth ?? 1;
    let progress = dx / width;
    if (progress < 0 && current >= total - 1) progress *= 0.25;
    if (progress > 0 && current <= 0) progress *= 0.25;
    setDrag(Math.max(-1, Math.min(1, progress)));
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.axis !== "x") {
      setDragging(false);
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDragging(false);
    if (drag <= -DRAG_THRESHOLD) next();
    else if (drag >= DRAG_THRESHOLD) prev();
    else setDrag(0);
  };

  const api = useMemo<BookApi>(
    () => ({ current, total, goTo, next, prev }),
    [current, total, goTo, next, prev],
  );

  return (
    <BookContext.Provider value={api}>
      <div
        ref={containerRef}
        className="book"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {leaves.map((leaf, index) => {
          const flipped = index < current;
          let angle = flipped ? -180 : 0;
          let active = false;

          if (drag < 0 && index === current) {
            angle = drag * 180;
            active = true;
          } else if (drag > 0 && index === current - 1) {
            angle = -180 + drag * 180;
            active = true;
          }

          const turning = active || index === flipping;
          const mostlyFlipped = angle <= -90;
          const zIndex = turning ? total + 1 : mostlyFlipped ? index : total - index;
          const shade = Math.min(1, Math.abs(angle) / 180);

          return (
            <div
              key={index}
              className="leaf"
              data-active={active || undefined}
              data-dragging={dragging || undefined}
              inert={index !== current}
              style={{ zIndex, transform: `rotateY(${angle}deg)` }}
            >
              <div className="leaf-face leaf-front">
                {leaf}
                <div
                  className="leaf-shade"
                  style={{
                    opacity:
                      index === flipping ? 0.5 : mostlyFlipped ? 0 : shade * 0.55,
                  }}
                />
              </div>
              <div className="leaf-face leaf-back">
                <div
                  className="leaf-shade leaf-shade-back"
                  style={{ opacity: mostlyFlipped ? (1 - shade) * 0.5 : 0 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <nav className="book-nav" aria-label="Navegação do convite">
        <button
          type="button"
          onClick={prev}
          disabled={current === 0}
          aria-label="Página anterior"
        >
          <Chevron direction="left" />
        </button>
        <span className="book-dots" role="presentation">
          {leaves.map((_, index) => (
            <i key={index} data-on={index === current || undefined} />
          ))}
        </span>
        <button
          type="button"
          onClick={next}
          disabled={current === total - 1}
          aria-label="Próxima página"
        >
          <Chevron direction="right" />
        </button>
      </nav>
    </BookContext.Provider>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
