import { NextResponse } from "next/server";

const palettes = [
  ["#1E211F", "#27302B", "#C96442"],
  ["#131616", "#263139", "#D8B164"],
  ["#171918", "#25332E", "#6AC58B"],
  ["#16171A", "#2E2A36", "#D96A6A"],
];

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const seed = Array.from(id).reduce((total, char) => total + char.charCodeAt(0), 0);
  const [bg, panel, accent] = palettes[seed % palettes.length];
  const label = id
    .split("-")
    .slice(0, 3)
    .join(" ")
    .toUpperCase();

  const svg = `
    <svg width="1200" height="720" viewBox="0 0 1200 720" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="720" rx="32" fill="${bg}" />
      <rect x="36" y="36" width="1128" height="648" rx="28" fill="${panel}" />
      <rect x="72" y="72" width="1056" height="460" rx="20" fill="url(#sky)" />
      <path d="M72 450C206 410 290 398 470 430C650 462 743 375 900 398C1003 412 1085 456 1128 480V532H72V450Z" fill="rgba(16,17,17,0.58)" />
      <circle cx="960" cy="170" r="54" fill="${accent}" fill-opacity="0.9" />
      <rect x="104" y="566" width="192" height="18" rx="9" fill="rgba(245,244,237,0.86)" />
      <rect x="104" y="604" width="318" height="18" rx="9" fill="rgba(183,178,168,0.55)" />
      <rect x="892" y="578" width="204" height="52" rx="14" fill="rgba(15,17,17,0.35)" />
      <text x="128" y="154" fill="rgba(245,244,237,0.92)" font-size="56" font-family="Arial, Helvetica, sans-serif">${label}</text>
      <text x="914" y="611" fill="#F5F4ED" font-size="24" font-family="Arial, Helvetica, sans-serif">OFFICIAL MOCK PREVIEW</text>
      <defs>
        <linearGradient id="sky" x1="200" y1="72" x2="920" y2="532" gradientUnits="userSpaceOnUse">
          <stop stop-color="${accent}" stop-opacity="0.26"/>
          <stop offset="1" stop-color="#0F1111" />
        </linearGradient>
      </defs>
    </svg>
  `.trim();

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, immutable",
    },
  });
}
