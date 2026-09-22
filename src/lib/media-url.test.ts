import { describe, expect, it } from "vitest";
import { directMediaUrl } from "./media-url";

describe("directMediaUrl", () => {
  it("converte o link de compartilhar do Drive", () => {
    expect(
      directMediaUrl(
        "https://drive.google.com/file/d/10oYotwazayh0n_VQBQtgGSdVpdPuo8Gj/view?usp=drivesdk",
      ),
    ).toBe("https://lh3.googleusercontent.com/d/10oYotwazayh0n_VQBQtgGSdVpdPuo8Gj");
  });

  it("aceita as outras formas de link do Drive", () => {
    const esperado = "https://lh3.googleusercontent.com/d/10oYotwazayh0n_VQBQtgGSd";
    expect(directMediaUrl("https://drive.google.com/open?id=10oYotwazayh0n_VQBQtgGSd")).toBe(esperado);
    expect(directMediaUrl("https://drive.google.com/uc?export=view&id=10oYotwazayh0n_VQBQtgGSd")).toBe(esperado);
  });

  it("pede o arquivo cru no Dropbox", () => {
    expect(directMediaUrl("https://www.dropbox.com/s/abc/foto.jpg?dl=0")).toBe(
      "https://www.dropbox.com/s/abc/foto.jpg?raw=1",
    );
  });

  it("não mexe em URL que já serve o arquivo", () => {
    const url = "https://exemplo.supabase.co/storage/v1/object/public/convite/foto.jpg";
    expect(directMediaUrl(url)).toBe(url);
    expect(directMediaUrl(null)).toBeNull();
  });
});
