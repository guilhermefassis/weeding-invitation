import { describe, expect, it } from "vitest";
import { householdSlug, slugify } from "./slug";

describe("slugify", () => {
  it("tira acentos e espaços", () => {
    expect(slugify("Família Gonçalves Júnior")).toBe("familia-goncalves-junior");
  });

  it("não deixa hífen sobrando nas pontas", () => {
    expect(slugify("  Família!  ")).toBe("familia");
  });

  it("limita o tamanho", () => {
    expect(slugify("a".repeat(80)).length).toBe(40);
  });
});

describe("householdSlug", () => {
  it("junta o nome da família com um sufixo aleatório", () => {
    expect(householdSlug("Família Oliveira")).toMatch(
      /^familia-oliveira-[a-z0-9]{5}$/,
    );
  });

  it("não colide entre duas famílias de mesmo nome", () => {
    const slugs = new Set(
      Array.from({ length: 50 }, () => householdSlug("Família Silva")),
    );
    expect(slugs.size).toBe(50);
  });

  it("tem um fallback quando o nome não gera slug", () => {
    expect(householdSlug("!!!")).toMatch(/^familia-[a-z0-9]{5}$/);
  });
});
