/**
 * Gerador de BR Code (PIX copia-e-cola) — padrão EMV®QRCPS do Banco Central.
 * Estático: nenhum gateway envolvido, o dinheiro cai direto na chave informada.
 */

type PixInput = {
  key: string;
  receiverName: string;
  city: string;
  amount?: number;
  txid?: string;
  description?: string;
};

function field(id: string, value: string): string {
  return id + String(value.length).padStart(2, "0") + value;
}

/** Remove acentos e caracteres fora da faixa aceita pelo BR Code. */
function sanitize(value: string, maxLength: number): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 $%*+\-./:]/g, "")
    .trim()
    .slice(0, maxLength)
    .toUpperCase();
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload({
  key,
  receiverName,
  city,
  amount,
  txid = "***",
  description,
}: PixInput): string {
  const merchantAccount =
    field("00", "BR.GOV.BCB.PIX") +
    field("01", key.trim()) +
    (description ? field("02", sanitize(description, 72)) : "");

  const payload =
    field("00", "01") +
    (amount ? field("01", "12") : "") +
    field("26", merchantAccount) +
    field("52", "0000") +
    field("53", "986") +
    (amount ? field("54", amount.toFixed(2)) : "") +
    field("58", "BR") +
    field("59", sanitize(receiverName, 25) || "RECEBEDOR") +
    field("60", sanitize(city, 15) || "BRASIL") +
    field("62", field("05", sanitize(txid, 25) || "***")) +
    "6304";

  return payload + crc16(payload);
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
