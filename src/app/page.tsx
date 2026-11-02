import { pageMetadata } from "@/lib/seo";
import Home from "./client";

export const metadata = pageMetadata({
  title: "ZYXEN – Digital Solutions & Creative Agency",
  description:
    "ZYXEN builds high-performance digital products, websites, branding, and solutions with modern design and smooth user experience.",
  path: "/",
  absoluteTitle: true,
});

export default function Page() {
  return <Home />;
}
