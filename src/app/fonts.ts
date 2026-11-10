import localFont from "next/font/local";

// `display: "optional"` means the browser uses the font only if it is already
// available at first paint; otherwise the fallback stays for that page view.
// So the fallback stacks matter, and they mirror the approved prototype.
export const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  display: "optional",
  weight: "100 900",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  display: "optional",
  weight: "100 900",
  // Next's automatic fallback metrics are Arial-based, wrong for a mono face.
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});
