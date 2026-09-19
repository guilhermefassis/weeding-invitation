"use client";

import { useState } from "react";
import type { GuestStatus, Household, InvitePage } from "@/lib/types";
import { formatDeadline, isRsvpClosed } from "@/lib/rsvp";
import { PageShell, hasMedia } from "../PageShell";

type Props = {
  page: InvitePage;
  household: Household | null;
  deadline: string | null;
};

export function RsvpPage({ page, household, deadline }: Props) {
  const dark = hasMedia(page);
  const [answers, setAnswers] = useState<Record<string, GuestStatus>>(() =>
    Object.fromEntries(
      (household?.guests ?? []).map((guest) => [guest.id, guest.status]),
    ),
  );
  const [note, setNote] = useState(household?.note ?? "");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const closed = isRsvpClosed(deadline);

  const guests = household?.guests ?? [];
  const answered = guests.filter((guest) => answers[guest.id] !== "pending").length;
  const confirmed = guests.filter((guest) => answers[guest.id] === "confirmed").length;

  async function submit() {
    if (!household || closed) return;
    setState("saving");
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdSlug: household.slug,
          note,
          answers: guests.map((guest) => ({
            guestId: guest.id,
            status: answers[guest.id] ?? "pending",
          })),
        }),
      });
      setState(response.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (!household) {
    return (
      <PageShell page={page}>
        <div className="flex flex-1 flex-col justify-center text-center">
          <p className={`eyebrow ${dark ? "text-white/80" : "text-accent"}`}>
            {page.eyebrow ?? "Confirmação de presença"}
          </p>
          <p
            className={`display mt-5 text-[1.05rem] ${
              dark ? "text-white/85" : "text-ink-soft"
            }`}
          >
            Esta é uma prévia do convite. A confirmação aparece no link
            individual de cada família.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell page={page} ornaments={false}>
      <header className="text-center">
        {page.eyebrow && (
          <p className={`eyebrow ${dark ? "text-white/80" : "text-accent"}`}>
            {page.eyebrow}
          </p>
        )}
        <h2
          className={`script mt-2 text-[2.5rem] ${dark ? "text-white" : "text-ink"}`}
        >
          {page.title ?? "Confirme sua presença"}
        </h2>
        {page.body && (
          <p
            className={`display mt-3 text-[0.98rem] leading-relaxed whitespace-pre-line ${
              dark ? "text-white/85" : "text-ink-soft"
            }`}
          >
            {page.body}
          </p>
        )}
        {deadline && !closed && (
          <p
            className={`display mt-3 text-[0.8rem] tracking-[0.18em] uppercase ${
              dark ? "text-white/70" : "text-accent"
            }`}
          >
            Confirme até {formatDeadline(deadline)}
          </p>
        )}
      </header>

      {closed ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="script text-[2.4rem] text-accent">Prazo encerrado</p>
          <p
            className={`display mt-3 max-w-[20rem] text-[1rem] ${
              dark ? "text-white/85" : "text-ink-soft"
            }`}
          >
            As confirmações se encerraram em {formatDeadline(deadline!)}. Se
            precisar ajustar alguma coisa, fale direto com os anfitriões.
          </p>
        </div>
      ) : state === "done" ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="script text-[2.6rem] text-accent">Obrigado!</p>
          <p
            className={`display mt-3 max-w-[18rem] text-[1rem] ${
              dark ? "text-white/85" : "text-ink-soft"
            }`}
          >
            {confirmed > 0
              ? `Anotamos ${confirmed} ${confirmed === 1 ? "presença" : "presenças"}. Até lá!`
              : "Que pena! Sentiremos sua falta."}
          </p>
          <button
            type="button"
            className="btn btn-ghost mt-6"
            onClick={() => setState("idle")}
          >
            Alterar resposta
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-7 flex flex-col gap-3">
            {guests.map((guest) => (
              <li
                key={guest.id}
                className="rounded-xl border border-ink/10 bg-white/60 p-3"
              >
                <p className="display text-[1.05rem] text-ink">
                  {guest.name}
                  {guest.is_child && (
                    <span className="ml-2 text-[0.7rem] tracking-[0.15em] text-ink-soft uppercase">
                      criança
                    </span>
                  )}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    [
                      ["confirmed", "Vou"],
                      ["declined", "Não vou"],
                    ] as const
                  ).map(([status, label]) => {
                    const on = answers[guest.id] === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [guest.id]: status }))
                        }
                        className={`rounded-lg border px-3 py-2 text-[0.78rem] tracking-[0.12em] uppercase transition ${
                          on
                            ? "border-accent bg-accent text-white"
                            : "border-ink/15 bg-white/70 text-ink-soft"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>

          <label className="mt-5 block">
            <span className="display text-[0.78rem] tracking-[0.18em] text-ink-soft uppercase">
              Quer deixar um recado?
            </span>
            <textarea
              className="field mt-2 w-full"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Restrição alimentar, horário de chegada, um abraço..."
            />
          </label>

          <button
            type="button"
            className="btn btn-primary mt-5 w-full"
            disabled={answered === 0 || state === "saving"}
            onClick={submit}
          >
            {state === "saving" ? "Enviando..." : "Confirmar"}
          </button>

          {state === "error" && (
            <p className="mt-3 text-center text-[0.85rem] text-red-700">
              Não conseguimos salvar. Tente de novo em instantes.
            </p>
          )}
        </>
      )}
    </PageShell>
  );
}
