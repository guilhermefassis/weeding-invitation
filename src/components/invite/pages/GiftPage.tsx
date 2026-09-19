"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { buildPixPayload, formatBRL } from "@/lib/pix";
import type { EventRecord, Household, InvitePage } from "@/lib/types";
import { PageShell, hasMedia } from "../PageShell";

type Props = {
  page: InvitePage;
  event: EventRecord;
  household: Household | null;
};

export function GiftPage({ page, event, household }: Props) {
  const dark = hasMedia(page);
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const payload = useMemo(() => {
    if (!event.pix_key) return null;
    return buildPixPayload({
      key: event.pix_key,
      receiverName: event.pix_key_owner ?? event.couple_names,
      city: event.pix_city ?? "BRASIL",
      amount: amount ?? undefined,
      description: event.title,
    });
  }, [event, amount]);

  useEffect(() => {
    if (!payload) return;
    let active = true;
    QRCode.toDataURL(payload, { margin: 1, width: 420, errorCorrectionLevel: "M" })
      .then((url) => {
        if (active) setQr(url);
      })
      .catch(() => setQr(null));
    return () => {
      active = false;
    };
  }, [payload]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    setCopied(true);
  }

  async function notify() {
    await fetch("/api/gift-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: event.id,
        householdSlug: household?.slug ?? null,
        name: household?.family_name ?? null,
        amount,
        message,
      }),
    });
    setSent(true);
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
          {page.title ?? "Para nos presentear"}
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
      </header>

      {!event.pix_key ? (
        <p className="display mt-10 text-center text-[0.95rem] text-ink-soft">
          A chave PIX ainda não foi cadastrada no painel.
        </p>
      ) : (
        <>
          {event.pix_suggestions.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {event.pix_suggestions.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAmount(amount === value ? null : value);
                    setCustom("");
                  }}
                  className={`rounded-full border px-4 py-2 text-[0.8rem] transition ${
                    amount === value
                      ? "border-accent bg-accent text-white"
                      : "border-ink/15 bg-white/70 text-ink-soft"
                  }`}
                >
                  {formatBRL(value)}
                </button>
              ))}
              <input
                className="field w-28 rounded-full text-center"
                inputMode="decimal"
                placeholder="Outro"
                value={custom}
                onChange={(input) => {
                  const raw = input.target.value.replace(",", ".");
                  setCustom(input.target.value);
                  const parsed = Number.parseFloat(raw);
                  setAmount(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
                }}
              />
            </div>
          )}

          {qr && (
            <div className="mt-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt="QR Code do PIX"
                className="h-48 w-48 rounded-xl bg-white p-2 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)]"
              />
            </div>
          )}

          <p className="display mt-4 text-center text-[0.85rem] text-ink-soft">
            {amount ? `Valor: ${formatBRL(amount)}` : "Sem valor definido — você escolhe no app do banco"}
          </p>

          <button type="button" className="btn btn-primary mt-4 w-full" onClick={copy}>
            {copied ? "Código copiado!" : "Copiar código PIX"}
          </button>

          <p className="display mt-3 text-center text-[0.78rem] text-ink-soft">
            Chave: {event.pix_key}
          </p>

          {sent ? (
            <p className="display mt-6 text-center text-[0.95rem] text-accent">
              Recebemos seu recado. Obrigado de coração!
            </p>
          ) : (
            <div className="mt-6">
              <label className="display block text-[0.78rem] tracking-[0.18em] text-ink-soft uppercase">
                Deixe um recado com o presente
              </label>
              <textarea
                className="field mt-2 w-full"
                rows={3}
                value={message}
                onChange={(input) => setMessage(input.target.value)}
                placeholder="Assim a gente sabe que foi você :)"
              />
              <button
                type="button"
                className="btn btn-ghost mt-3 w-full"
                disabled={message.trim().length === 0}
                onClick={notify}
              >
                Avisar os anfitriões
              </button>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
