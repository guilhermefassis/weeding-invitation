"use client";

import { useState, useTransition } from "react";
import { markInviteSent, sendInviteAutomatically } from "../actions";
import { whatsappLink } from "@/lib/whatsapp";

type Props = {
  householdId: string;
  link: string;
  message: string;
  phone: string | null;
  cloudApi: boolean;
};

export function HouseholdActions({
  householdId,
  link,
  message,
  phone,
  cloudApi,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function openWhatsapp() {
    if (!phone) return;
    window.open(whatsappLink(phone, message), "_blank", "noopener");
    startTransition(async () => {
      await markInviteSent(householdId);
      setFeedback("Marcado como enviado.");
    });
  }

  function sendAutomatically() {
    if (!phone) return;
    startTransition(async () => {
      const result = await sendInviteAutomatically(householdId, message, phone);
      setFeedback(result.ok ? "Enviado pelo WhatsApp." : `Falhou: ${result.error}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs"
        onClick={() => {
          navigator.clipboard.writeText(link);
          setFeedback("Link copiado.");
        }}
      >
        Copiar link
      </button>

      <button
        type="button"
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs disabled:opacity-40"
        disabled={!phone || pending}
        onClick={openWhatsapp}
      >
        Abrir no WhatsApp
      </button>

      {cloudApi && (
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white disabled:opacity-40"
          disabled={!phone || pending}
          onClick={sendAutomatically}
        >
          Enviar automático
        </button>
      )}

      {feedback && <span className="text-xs text-zinc-500">{feedback}</span>}
    </div>
  );
}
