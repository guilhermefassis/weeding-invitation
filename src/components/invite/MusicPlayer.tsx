"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Navegadores bloqueiam autoplay com som, então a música só começa no
 * primeiro toque do convidado — que é justamente quando ele vira a página.
 */
export function MusicPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const start = () => {
      audioRef.current?.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    };
    window.addEventListener("pointerdown", start, { once: true });
    return () => window.removeEventListener("pointerdown", start);
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true), () => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Desligar a música" : "Ligar a música"}
        className="absolute top-[max(16px,env(safe-area-inset-top))] right-4 z-[80] grid h-10 w-10 place-items-center rounded-full bg-paper/75 text-ink-soft shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)] backdrop-blur"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path
            d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4v-5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {playing ? (
            <path
              d="M15.5 9.2a4 4 0 0 1 0 5.6M18 7a7 7 0 0 1 0 10"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="m15.5 9.5 5 5m0-5-5 5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
    </>
  );
}
