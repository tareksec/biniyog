import { createFileRoute } from "@tanstack/react-router";
import { fetchOpportunitiesSSR } from "@/lib/projects";
import { fetchPublishedBlogPosts } from "@/lib/blog";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = "https://biniyogbriddhi.com";

        const [opportunities, blogPosts] = await Promise.all([
          fetchOpportunitiesSSR().catch(() => []),
          fetchPublishedBlogPosts().catch(() => []),
        ]);

        interface SitemapItem {
          loc: string;
          priority: string;
          changefreq: string;
          lastmod?: string;
        }

        const staticPages: SitemapItem[] = [
          { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
          { loc: `${baseUrl}/about`, priority: "0.9", changefreq: "weekly" },
          { loc: `${baseUrl}/opportunities`, priority: "0.9", changefreq: "daily" },
          { loc: `${baseUrl}/blog`, priority: "0.8", changefreq: "daily" },
          { loc: `${baseUrl}/reviews`, priority: "0.6", changefreq: "weekly" },
          { loc: `${baseUrl}/insights`, priority: "0.6", changefreq: "weekly" },
        ];

        const opportunityPages: SitemapItem[] = (opportunities || []).map((opp) => {
          const slugOrId = opp.slug || opp.id;
          return {
            loc: `${baseUrl}/opportunities/${slugOrId}`,
            priority: "0.8",
            changefreq: "weekly",
            lastmod: opp.created_at ? new Date(opp.created_at).toISOString().split("T")[0] : undefined,
          };
        });

        const blogPages: SitemapItem[] = (blogPosts || []).map((post) => ({
          loc: `${baseUrl}/blog/${post.slug}`,
          priority: "0.7",
          changefreq: "weekly",
          lastmod: (post.updated_at || post.published_at)
            ? new Date(post.updated_at || post.published_at!).toISOString().split("T")[0]
            : undefined,
        }));

        const urls: SitemapItem[] = [
          staticPages[0], // /
          staticPages[1], // /about
          staticPages[2], // /opportunities
          ...opportunityPages,
          staticPages[3], // /blog
          ...blogPages,
          staticPages[4], // /reviews
          staticPages[5], // /insights
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
