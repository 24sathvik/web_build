import { pageMetadata } from "@/lib/seo";
import Technology from "./client";

export const metadata = pageMetadata({
  title: "Technology | How ZYXEN Builds Fast, Scalable Software",
  description: "The modern stack ZYXEN uses to build fast, secure and scalable web platforms and business software.",
  path: "/technology",
  absoluteTitle: true,
});

export default function Page() {
  return <Technology />;
}
