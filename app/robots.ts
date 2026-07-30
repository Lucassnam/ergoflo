import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* Required by `output: "export"`. Without it the build fails outright with
   "Failed to collect page data for /robots.txt" — this is not optional
   tidying. Same for app/sitemap.ts. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The API route has nothing to index and should not be crawled.
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
