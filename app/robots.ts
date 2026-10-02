import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/auth/", "/reset-password", "/courses/*/learn/"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
