import "server-only";
import fs from "fs";
import path from "path";
import { Marked } from "marked";

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

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export interface HeadingItem {
  id: string;
  text: string;
}

export function extractH2Headings(html: string): HeadingItem[] {
  const matches = [...html.matchAll(/<h2[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h2>/gi)];
  return matches.map((m) => ({
    id: m[1],
    text: m[2].replace(/<[^>]*>/g, "").trim(),
  }));
}

const customMarked = new Marked({
  async: false,
});

customMarked.use({
  renderer: {
    heading({ tokens, depth, text }) {
      const p = this.parser.parseInline(tokens);
      if (depth === 2 || depth === 3) {
        const id = slugifyHeading(text || p);
        return `<h${depth} id="${id}">${p}</h${depth}>\n`;
      }
      return `<h${depth}>${p}</h${depth}>\n`;
    },
    image({ href, title, text }) {
      const titleAttr = title ? ` title="${title}"` : "";
      return `<img src="${href}" alt="${text || ""}"${titleAttr} loading="lazy" />`;
    },
  },
});

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

  let html = customMarked.parse(cleaned) as string;

  // Add id to any remaining h2 or h3 missing an id
  html = html.replace(
    /<h([23])(?![^>]*\bid=)([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_, level, attrs, headingText) => {
      const plainText = headingText.replace(/<[^>]*>/g, "").trim();
      const id = slugifyHeading(plainText);
      return `<h${level}${attrs} id="${id}">${headingText}</h${level}>`;
    }
  );

  // Ensure all img tags have loading="lazy"
  html = html.replace(/<img(?![^>]*\bloading=)([^>]*?)(\/?>)/gi, '<img$1 loading="lazy"$2');

  return html;
}

/** Encode local paths that contain unicode/space characters; leave absolute URLs alone. */
export function safeImageSrc(src: string): string {
  return src.startsWith("http") ? src : encodeURI(src);
}
