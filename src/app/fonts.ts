import localFont from "next/font/local";

// `display: "optional"` means the browser uses the font only if it is already
// available at first paint; otherwise the fallback stays for that page view.
// So the fallback stacks matter, and every face is preloaded: each one is on
// the first screen of the home or the CV (the name, the body, the years).
//
// Three families, three jobs: Geist carries everything read or pressed,
// Piazzolla (Huerta Tipográfica) sets the headings, Chivo Mono (Omnibus-Type)
// sets data: dates, numbers, captions, diagram labels and code. Piazzolla and
// Chivo Mono are Google Fonts' latin subset (Spanish included), OFL; see the
// LICENSE files next to them.
export const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  display: "optional",
  weight: "100 900",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

// Variable on two axes: weight, and optical size (8-30), which the browser
// follows from the font size (`font-optical-sizing: auto`).
export const piazzolla = localFont({
  src: "./fonts/Piazzolla-Variable.woff2",
  variable: "--font-piazzolla",
  display: "optional",
  weight: "100 900",
  // A serif fallback, its metrics adjusted to Piazzolla's, so a page view that
  // keeps the fallback sets its headings in the same space.
  adjustFontFallback: "Times New Roman",
  fallback: ["ui-serif", "Georgia", "serif"],
});

export const chivoMono = localFont({
  src: "./fonts/ChivoMono-Variable.woff2",
  variable: "--font-chivo-mono",
  display: "optional",
  weight: "100 900",
  // Next's automatic fallback metrics are Arial-based, wrong for a mono face.
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});
