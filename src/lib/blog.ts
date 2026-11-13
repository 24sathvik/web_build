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
  updatedDate?: string;
  readTime: string;
  category: string;
  featured: boolean;
  published: boolean;
  /** Normalised cover image (CMS posts store it as `coverImage`, older posts as `image`). */
  image: string;
  coverImageAlt?: string;
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
        updatedDate: raw.updatedDate,
        readTime: raw.readTime ?? "",
        category: raw.category ?? "General",
        featured: Boolean(raw.featured),
        published: true,
        image: raw.image || raw.coverImage || FALLBACK_IMAGE,
        coverImageAlt: raw.coverImageAlt,
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
  let cleaned = content.replace(/<!--[\s\S]*?-->/g, "");

  // Remove first top-level heading (either markdown '# ' or html '<h1>...</h1>')
  let firstH1Removed = false;
  cleaned = cleaned.replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/i, () => {
    firstH1Removed = true;
    return "";
  });

  if (!firstH1Removed) {
    cleaned = cleaned.replace(/^[ \t]*#[ \t]+([^\r\n]+)/m, () => {
      firstH1Removed = true;
      return "";
    });
  }

  // Demote any remaining '# ' to '## '
  cleaned = cleaned.replace(/^[ \t]*#[ \t]+([^\r\n]+)/gm, "## $1");

  // Demote any remaining <h1> to <h2>
  cleaned = cleaned.replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/gi, "<h2$1>$2</h2>");

  return marked.parse(cleaned, { async: false }) as string;
}

/** Encode local paths that contain unicode/space characters; leave absolute URLs alone. */
export function safeImageSrc(src: string): string {
  return src.startsWith("http") ? src : encodeURI(src);
}
