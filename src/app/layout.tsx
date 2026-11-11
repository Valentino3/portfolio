import type { Metadata } from "next";
import { HydrationFlag } from "@/components/site/hydration-flag";
import { SiteFooter } from "@/components/site/site-footer";
import { OPEN_GRAPH_SITE, SITE_URL } from "@/lib/site";
import { geistMono, geistSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Valentino Rota — Design Engineer",
  description:
    "Design engineer who builds the whole product: production web apps, design systems, auth and APIs. Based in Mar del Plata, Argentina, open to roles in Buenos Aires or remote.",
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
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <div className="mx-auto max-w-site px-gutter">
          {children}
          <SiteFooter />
        </div>
        <HydrationFlag />
      </body>
    </html>
  );
}
