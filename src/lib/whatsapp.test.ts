import { describe, expect, it } from "vitest";
import {
  DEFAULT_WHATSAPP_TEMPLATE,
  inviteUrl,
  normalizePhone,
  renderTemplate,
  whatsappLink,
} from "./whatsapp";
import { demoInvite } from "./demo-data";

describe("normalizePhone", () => {
  it("adiciona o código do Brasil e limpa a máscara", () => {
    expect(normalizePhone("(11) 99999-9999")).toBe("5511999999999");
  });

  it("preserva o número que já veio com o 55", () => {
    expect(normalizePhone("+55 11 99999-9999")).toBe("5511999999999");
  });

  it("aceita telefone fixo com DDD", () => {
    expect(normalizePhone("1133334444")).toBe("551133334444");
  });

  it("rejeita o que não é telefone", () => {
    expect(normalizePhone("123")).toBeNull();
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone(null)).toBeNull();
  });
});

describe("inviteUrl", () => {
  it("monta o link da família", () => {
    expect(inviteUrl("https://convite.com", "oliveira-a7f3")).toBe(
      "https://convite.com/convite/oliveira-a7f3",
    );
  });

  it("não duplica a barra final", () => {
    expect(inviteUrl("https://convite.com/", "x")).toBe(
      "https://convite.com/convite/x",
    );
  });
});

describe("renderTemplate", () => {
  const household = {
    slug: "oliveira-a7f3",
    family_name: "Família Oliveira",
    greeting: "Ricardo e família",
  };

  it("troca todas as variáveis", () => {
    const message = renderTemplate(
      DEFAULT_WHATSAPP_TEMPLATE,
      demoInvite.event,
      household,
      "https://convite.com",
    );

    expect(message).toContain("Ricardo e família");
    expect(message).toContain("Guilherme & Fernanda");
    expect(message).toContain("Bodas de Trigo");
    expect(message).toContain("Casa das Oliveiras");
    expect(message).toContain("https://convite.com/convite/oliveira-a7f3");
    expect(message).not.toMatch(/\{\w+\}/);
  });

  it("usa o nome da família quando não há saudação", () => {
    const message = renderTemplate(
      "Oi, {saudacao}!",
      demoInvite.event,
      { ...household, greeting: null },
      "https://convite.com",
    );

    expect(message).toBe("Oi, Família Oliveira!");
  });

  it("deixa variável desconhecida intacta em vez de apagar", () => {
    const message = renderTemplate(
      "Oi {saudacao}, {inexistente}",
      demoInvite.event,
      household,
      "https://convite.com",
    );

    expect(message).toBe("Oi Ricardo e família, {inexistente}");
  });
});

describe("whatsappLink", () => {
  it("escapa a mensagem na querystring", () => {
    const link = whatsappLink("5511999999999", "Oi, tudo bem? #festa");

    expect(link.startsWith("https://wa.me/5511999999999?text=")).toBe(true);
    expect(link).toContain("%23festa");
  });
});
