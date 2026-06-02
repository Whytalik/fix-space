import { ImageResponse } from "next/og";

export const alt = "FIX Space — CFD Trader's Workspace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0b0d12",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: "0 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: "#3b82f6",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            F
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-1px" }}>FIX Space</div>
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 760,
            lineHeight: 1.4,
          }}
        >
          Your entire trading experience in one environment.
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 12,
          }}
        >
          {["Trading Journal", "Daily Routine", "Analytics", "Broker Import"].map((label) => (
            <div
              key={label}
              style={{
                background: "#1e2433",
                border: "1px solid #2d3748",
                borderRadius: 8,
                padding: "6px 16px",
                fontSize: 15,
                color: "#64748b",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
