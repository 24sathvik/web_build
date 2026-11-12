import { pageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/blog";
import { SiteFooter } from "@/components/dom/SiteFooter";
import Blogs from "./client";

export const metadata = pageMetadata({
  title: "The Discourse | Zyxen Blog",
  description:
    "Exploring the intersection of neural intelligence, human elegance, and digital engineering.",
  path: "/blogs",
  absoluteTitle: true,
});

export default function Page() {
  const posts = getAllPosts().map(({ content: _content, ...rest }) => rest);
  return <Blogs posts={posts} footer={<SiteFooter />} />;
}
