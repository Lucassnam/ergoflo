import path from "node:path";
import type { NextConfig } from "next";

/* ============================================================
   STATIC EXPORT — Cloudflare Pages.

   This site emits plain HTML/CSS/JS into `out/`. There is no Node
   server in production. That is deliberate: an earlier EC2/Docker
   deployment OOM'd on a 1 GB box, and a per-request Supabase client
   in the old /api/notify route leaked ~13 KB of live heap per
   request (measured: 113 MB -> 2.5 GB over 60k POSTs). Neither
   failure mode can exist without a long-lived server process.

   WHERE THE SECURITY HEADERS WENT — READ THIS BEFORE ADDING ANY.
   Next's `headers()` config does NOTHING in a static export. It is
   silently ignored: the build succeeds and the site ships with no
   CSP, no HSTS and no clickjacking protection, and nothing warns
   you. Every header now lives in `public/_headers`, which
   Cloudflare Pages reads. If you need to change a header, change it
   THERE. Do not re-add a `headers()` block here — it will look like
   it works and it will not.

   THE DYNAMIC BIT. /api/notify is no longer a Next route. It is a
   Cloudflare Pages Function at `functions/api/notify.ts`, which
   runs on the Workers runtime at the same URL. app/api/ cannot
   exist in a static export at all.
   ============================================================ */
const nextConfig: NextConfig = {
  output: "export",

  /* No server means no /_next/image optimizer and no `sharp`. That
     removes a measured ~135 MB resident arena, at the cost of
     serving images at their natural size — so keep source images
     small. `product-hero.png` (2.3 MB, unreferenced) was deleted
     for exactly this reason; don't reintroduce large PNGs. */
  images: { unoptimized: true },

  // There's a stray package-lock.json in the home directory on this machine,
  // which makes Turbopack infer the wrong workspace root. Pin it.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
