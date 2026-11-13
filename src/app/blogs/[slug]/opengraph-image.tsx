import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { generateOgImage, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return generateOgImage({
    title: post ? post.title : "ZYXEN Article",
    category: post ? post.category.toUpperCase() : "ARTICLE",
    description: post ? post.excerpt : undefined,
  });
}

