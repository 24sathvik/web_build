import { getAllPosts, safeImageSrc } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();

  const xmlItems = posts
    .map((post) => {
      const url = `${SITE_URL}/blogs/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();
      const imageUrl = post.image.startsWith("http")
        ? post.image
        : `${SITE_URL}${safeImageSrc(post.image)}`;

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
      <category><![CDATA[${post.category}]]></category>
      <enclosure url="${imageUrl}" type="image/jpeg" length="0" />
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ZYXEN Blog - Engineering, Systems &amp; Web Design</title>
    <link>${SITE_URL}/blogs</link>
    <description>Articles and technical guides from ZYXEN on web performance, aviation software, production systems, and digital engineering.</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/blogs/feed.xml" rel="self" type="application/rss+xml"/>
${xmlItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

