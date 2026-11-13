import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = "image/png";

let cachedFont: Buffer | null = null;
function getFontData(): Buffer {
  if (!cachedFont) {
    const fontFile = path.join(process.cwd(), "src", "assets", "fonts", "font.ttf");
    cachedFont = fs.readFileSync(fontFile);
  }
  return cachedFont;
}

interface OgCardOptions {
  title: string;
  category?: string;
  description?: string;
}

export function generateOgImage({
  title,
  category = "DIGITAL SOLUTIONS",
  description,
}: OgCardOptions) {
  const fontData = getFontData();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#050505",
          padding: "70px 80px",
          position: "relative",
          fontFamily: "Geist",
          overflow: "hidden",
        }}
      >
        {/* Subtle radial glow background accents */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 217, 255, 0.16) 0%, rgba(5,5,5,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-140px",
            left: "-120px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(110, 91, 255, 0.14) 0%, rgba(5,5,5,0) 70%)",
            display: "flex",
          }}
        />

        {/* Top Header: Brand Mark + Category Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #00D9FF 0%, #6E5BFF 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#050505",
                fontWeight: 900,
                fontSize: "24px",
              }}
            >
              Z
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 800,
                letterSpacing: "0.15em",
                color: "#FFFFFF",
              }}
            >
              ZYXEN
            </span>
          </div>

          <div
            style={{
              padding: "8px 22px",
              borderRadius: "9999px",
              border: "1px solid rgba(0, 217, 255, 0.4)",
              background: "rgba(0, 217, 255, 0.08)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#00D9FF",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {category}
          </div>
        </div>

        {/* Middle Content: Title and optional Description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            position: "relative",
            maxWidth: "1040px",
          }}
        >
          <div
            style={{
              fontSize: title.length > 45 ? "50px" : "60px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            {title}
          </div>

          {description && (
            <div
              style={{
                fontSize: "22px",
                lineHeight: 1.45,
                color: "#BFC7D5",
                display: "flex",
              }}
            >
              {description.length > 140 ? `${description.slice(0, 137)}...` : description}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "24px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              letterSpacing: "0.06em",
              color: "#8E99A8",
              display: "flex",
            }}
          >
            Web Engineering &bull; Aviation Systems &bull; Enterprise Software
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#00D9FF",
              display: "flex",
            }}
          >
            zyxen.in
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        {
          name: "Geist",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}

