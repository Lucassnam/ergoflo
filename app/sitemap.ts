import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* /specs, /investors and /refunds were deleted on 2026-07-29 and must not be
   listed here — a sitemap entry for a 404 is a live SEO error. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, priority: 1 },
    { url: `${SITE_URL}/about`, lastModified, priority: 0.8 },
    { url: `${SITE_URL}/notify`, lastModified, priority: 0.8 },
    { url: `${SITE_URL}/terms`, lastModified, priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified, priority: 0.3 },
  ];
}
