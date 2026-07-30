import path from "node:path";
import type { NextConfig } from "next";

/* ============================================================
   CONTENT SECURITY POLICY

   `img-src` MUST keep images.unsplash.com — the scroll-morph hero loads
   20 remote photos with raw <img> tags. Drop it and the hero renders
   empty, with only a console error to show for it.

   `script-src` allows 'unsafe-inline'. Next injects inline bootstrap
   scripts, and the strict alternative is a nonce issued from middleware
   on every request, which makes every page dynamic and is a
   meaningfully riskier change to a working hero. This is a documented
   trade-off, not an oversight. For the strict version, add a middleware
   that generates a per-request nonce and swap 'unsafe-inline' for
   'nonce-<value>'.

   `connect-src` covers the same-origin POST to /api/notify. If a
   third-party service is ever added (analytics, Turnstile, a chat
   widget) it needs an entry here AND a line in /privacy — that page
   states plainly that there is no third-party tracking, and that
   statement has to stay true.

   `frame-ancestors 'none'` is the modern clickjacking defence;
   X-Frame-Options below is the legacy equivalent for older browsers.
   ============================================================ */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  // Same-origin only. Stripe was removed on 2026-07-29 — the site takes no
  // payments, so no form may post off-origin. If checkout ever returns, this
  // is one of the places that has to change.
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Caddy terminates TLS on ergoflo.tech and redirects :80 → :443
  // automatically, so asserting HSTS here is safe. `preload` is a
  // one-way door: once the domain is submitted to the preload list,
  // browsers refuse plain HTTP for it and removal takes months. Keep it
  // only while every subdomain is genuinely HTTPS-only.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  /* Emits .next/standalone — a self-contained server.js plus only the
     node_modules it actually traced. The Dockerfile depends on this; drop
     it and the runner stage has nothing to copy and the image will not
     boot. Note that standalone deliberately excludes `public` and
     `.next/static`, which is why the Dockerfile copies both by hand. */
  output: "standalone",

  // There's a stray package-lock.json in the home directory on this machine,
  // which makes Turbopack infer the wrong workspace root. Pin it.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Don't advertise the framework version to scanners.
  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The notify endpoint must never be cached — a cached 200 would make
        // both the rate limiter and the honeypot meaningless.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};

export default nextConfig;
