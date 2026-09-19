/**
 * Envio automático pela WhatsApp Cloud API (oficial da Meta).
 * Só entra em ação quando as credenciais existem; sem elas o painel cai no
 * modo manual (link wa.me), que não depende de aprovação de template.
 */

export function hasCloudApi(): boolean {
  return Boolean(
    process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_TOKEN,
  );
}

type SendResult = { ok: true } | { ok: false; error: string };

export async function sendWhatsappMessage(
  phone: string,
  message: string,
): Promise<SendResult> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;
  if (!phoneId || !token) return { ok: false, error: "Cloud API não configurada" };

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { preview_url: true, body: message },
      }),
    },
  );

  if (response.ok) return { ok: true };

  const body = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  return { ok: false, error: body?.error?.message ?? `HTTP ${response.status}` };
}
