/* eslint-disable @next/next/no-img-element -- ImageResponse dibuja con Satori, que solo entiende <img>, no next/image. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "ComiDeli: el ranking del pollo de Cochabamba";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Lee una imagen de public/brand como data URI (ImageResponse no resuelve rutas relativas). */
async function brandImage(file: string): Promise<string> {
  const data = await readFile(join(process.cwd(), "public", "brand", file), "base64");
  return `data:image/png;base64,${data}`;
}

/** Imagen para compartir la página principal y perfiles sin foto. */
export default async function OpenGraphImage() {
  const [logo, cholita] = await Promise.all([brandImage("comideli-logo.png"), brandImage("cholita.png")]);

  return new ImageResponse(
    <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 72, backgroundColor: "#f8f5ef", color: "#1b1917" }}>
      {/* 958×250 → 307×80 */}
      <img src={logo} alt="" width={307} height={80} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", fontSize: 77, fontWeight: 800, lineHeight: 1.08 }}>El pollo broaster</div>
        <div style={{ display: "flex", fontSize: 77, fontWeight: 800, lineHeight: 1.08, color: "#bc420b" }}>de Cochabamba.</div>
        <div style={{ display: "flex", fontSize: 25, color: "#695e55" }}>El ranking que hacemos entre todos.</div>
      </div>
      <div style={{ display: "flex", width: 640, height: 12, borderRadius: 6, backgroundColor: "#e94d0c" }} />
      {/* 488×460 → 424×400, abajo a la derecha */}
      <img src={cholita} alt="" width={424} height={400} style={{ position: "absolute", right: 56, bottom: 72 }} />
    </div>,
    size,
  );
}
