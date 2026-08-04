import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* Required by `output: "export"` — see the note in app/robots.ts. */
export const dynamic = "force-static";

/* /specs and /investors were deleted on 2026-07-29 and must not be listed
   here — a sitemap entry for a 404 is a live SEO error.

   /refunds was on that deleted list until 2026-08-04. It exists again, and
   it is now a page a buyer is entitled to find: a site that takes payment
   and leaves its cancellation terms out of the sitemap looks like it is
   hiding them. /preorder is listed for the same reason.

   /preorder/success is deliberately ABSENT and carries robots:noindex — it
   is a post-payment URL with a session id in the query string and no value
   in search results. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, priority: 1 },
    { url: `${SITE_URL}/preorder`, lastModified, priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified, priority: 0.8 },
    { url: `${SITE_URL}/notify`, lastModified, priority: 0.8 },
    { url: `${SITE_URL}/terms`, lastModified, priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified, priority: 0.3 },
    { url: `${SITE_URL}/refunds`, lastModified, priority: 0.3 },
  ];
}
