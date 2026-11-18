import type { Metadata } from "next";
import { HydrationFlag } from "@/components/site/hydration-flag";
import { SiteFooter } from "@/components/site/site-footer";
import { OPEN_GRAPH_SITE, SITE_URL } from "@/lib/site";
import { chivoMono, geistSans, piazzolla } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Valentino Rota — Design Engineer",
  description:
    "Design engineer who builds the whole product: production web apps, design systems, auth and APIs. Based in Mar del Plata, Argentina; open to design engineering and full-stack roles, remote or on-site in Buenos Aires (relocating).",
  // Relative URLs resolve against metadataBase, so both come out absolute.
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", ...OPEN_GRAPH_SITE },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${piazzolla.variable} ${chivoMono.variable}`}
    >
      <body>
        {/* The first stop for Tab: past the header, straight to the page's own content. Hidden
            until focused; every page gives its <main> the id. */}
        <a
          href="#main"
          className="sr-only rounded-base border border-rule-strong bg-paper px-3 py-2 text-ui-sm text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 print:hidden"
        >
          Skip to content
        </a>
        <div className="mx-auto max-w-site px-gutter">
          {children}
          <SiteFooter />
        </div>
        <HydrationFlag />
      </body>
    </html>
  );
}
