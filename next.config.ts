import type { NextConfig } from "next";

/**
 * Baseline security headers for every response. No Content-Security-Policy: Next's inline scripts
 * would need a per-request nonce, and these pages are prerendered.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // `next dev` would otherwise write a managed AGENTS.md into the repository.
  agentRules: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
