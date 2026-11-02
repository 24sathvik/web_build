import "server-only";
import fs from "fs";
import path from "path";
import { marked } from "marked";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  featured: boolean;
  published: boolean;
  /** Normalised cover image (CMS posts store it as `coverImage`, older posts as `image`). */
  image: string;
}

const blogsDirectory = path.join(process.cwd(), "content", "blog");
const FALLBACK_IMAGE = "/previews/og-image.png";

type RawPost = Partial<BlogPost> & { coverImage?: string };

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(blogsDirectory)) return [];

  const posts: BlogPost[] = [];
  for (const fileName of fs.readdirSync(blogsDirectory)) {
    if (!fileName.endsWith(".json")) continue;
    try {
      const raw = JSON.parse(
        fs.readFileSync(path.join(blogsDirectory, fileName), "utf8"),
      ) as RawPost;
      // Same rule as the live site: only explicitly published posts are public.
      if (raw.published !== true || !raw.slug || !raw.title) continue;
      posts.push({
        id: raw.id ?? raw.slug,
        slug: raw.slug,
        title: raw.title,
        excerpt: raw.excerpt ?? "",
        content: raw.content ?? "",
        author: raw.author ?? "Zyxen Team",
        date: raw.date ?? "",
        readTime: raw.readTime ?? "",
        category: raw.category ?? "General",
        featured: Boolean(raw.featured),
        published: true,
        image: raw.image || raw.coverImage || FALLBACK_IMAGE,
      });
    } catch (e) {
      console.error(`Error parsing ${fileName}`, e);
    }
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** Markdown (or HTML from the CMS) -> HTML. Content is authored by the site owner via the CMS. */
export function renderContent(content: string): string {
  const withoutComments = content.replace(/<!--[\s\S]*?-->/g, "");
  return marked.parse(withoutComments, { async: false }) as string;
}

/** Encode local paths that contain unicode/space characters; leave absolute URLs alone. */
export function safeImageSrc(src: string): string {
  return src.startsWith("http") ? src : encodeURI(src);
}
