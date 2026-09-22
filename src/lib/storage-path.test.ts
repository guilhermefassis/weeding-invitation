import { describe, expect, it } from "vitest";
import { storagePathFromUrl } from "./storage-path";

describe("storagePathFromUrl", () => {
  it("extrai o caminho de uma URL pública do Storage", () => {
    expect(
      storagePathFromUrl(
        "https://abc.supabase.co/storage/v1/object/public/convite/galeria/foto.jpg",
      ),
    ).toBe("galeria/foto.jpg");
  });

  it("ignora a query string", () => {
    expect(
      storagePathFromUrl(
        "https://abc.supabase.co/storage/v1/object/public/convite/galeria/foto.jpg?t=123",
      ),
    ).toBe("galeria/foto.jpg");
  });

  it("desfaz o escape do nome", () => {
    expect(
      storagePathFromUrl(
        "https://abc.supabase.co/storage/v1/object/public/convite/galeria/nossa%20foto.jpg",
      ),
    ).toBe("galeria/nossa foto.jpg");
  });

  it("devolve nulo para mídia que veio de fora", () => {
    expect(storagePathFromUrl("https://lh3.googleusercontent.com/d/abc")).toBeNull();
  });
});
