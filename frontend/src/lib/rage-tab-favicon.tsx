import { ImageResponse } from "next/og";

const ACCENT = "#4BFA94";

/** Circular tab / home-screen mark — distinct from the wordmark in the header. */
function rageTabIconElement(size: number) {
  const ring = Math.max(1.5, size * 0.075);
  const inset = ring + Math.max(1, size * 0.03);
  const fontSize = Math.round(size * 0.4);
  const hair = Math.max(1, Math.round(size * 0.055));
  const crossLen = size * 0.24;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "radial-gradient(circle at 32% 26%, #181818 0%, #050505 55%, #000000 100%)",
        borderRadius: size / 2,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: size - inset * 2,
          height: size - inset * 2,
          left: inset,
          top: inset,
          borderRadius: (size - inset * 2) / 2,
          border: `${ring}px solid ${ACCENT}`,
          boxShadow: `0 0 ${Math.round(size * 0.16)}px rgba(75, 250, 148, 0.4), inset 0 0 ${Math.round(size * 0.1)}px rgba(75, 250, 148, 0.07)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: cx - hair / 2,
          top: cy - crossLen / 2,
          width: hair,
          height: crossLen,
          background: ACCENT,
          opacity: 0.5,
          borderRadius: hair,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: cx - crossLen / 2,
          top: cy - hair / 2,
          width: crossLen,
          height: hair,
          background: ACCENT,
          opacity: 0.5,
          borderRadius: hair,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          fontSize,
          fontWeight: 900,
          color: "#ffffff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "-0.07em",
          marginTop: -Math.round(size * 0.02),
          textShadow: `0 ${Math.max(1, Math.round(size * 0.02))}px ${Math.round(size * 0.05)}px rgba(0,0,0,0.8)`,
        }}
      >
        R
      </div>
    </div>
  );
}

export function rageTabFaviconImageResponse(size: number) {
  return new ImageResponse(rageTabIconElement(size), {
    width: size,
    height: size,
  });
}
