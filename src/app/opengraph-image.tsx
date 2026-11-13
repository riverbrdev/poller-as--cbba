import { ImageResponse } from "next/og";

export const alt = "ComiDeli: el ranking del pollo de Cochabamba";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen para compartir la página principal y perfiles sin foto. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 72, backgroundColor: "#f8f5ef", color: "#1b1917" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 18, backgroundColor: "#e94d0c", color: "white", fontSize: 42, fontWeight: 800 }}>C</div>
        <span style={{ fontSize: 34, fontWeight: 800 }}>ComiDeli</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", fontSize: 77, fontWeight: 800, lineHeight: 1.08 }}>El pollo broaster</div>
        <div style={{ display: "flex", fontSize: 77, fontWeight: 800, lineHeight: 1.08, color: "#bc420b" }}>de Cochabamba.</div>
        <div style={{ display: "flex", fontSize: 25, color: "#695e55" }}>El ranking que hacemos entre todos.</div>
      </div>
      <div style={{ display: "flex", width: "100%", height: 12, borderRadius: 6, backgroundColor: "#e94d0c" }} />
    </div>,
    size,
  );
}
