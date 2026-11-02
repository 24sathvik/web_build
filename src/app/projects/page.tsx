import { pageMetadata } from "@/lib/seo";
import Projects from "./client";

export const metadata = pageMetadata({
  title: "Projects | ZYXEN Software & Web Work",
  description: "Selected ZYXEN projects: exam portals, finance systems, sales management, ERP and high-performance websites.",
  path: "/projects",
  absoluteTitle: true,
});

export default function Page() {
  return <Projects />;
}
