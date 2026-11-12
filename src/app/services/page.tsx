import { pageMetadata } from "@/lib/seo";
import { SiteFooter } from "@/components/dom/SiteFooter";
import Services from "./client";

export const metadata = pageMetadata({
  title: "Services | ZYXEN – Web, Software, Automation & AI",
  description: "Web development, custom software, automation, exam portals, finance systems and ERP built by ZYXEN.",
  path: "/services",
  absoluteTitle: true,
});

export default function Page() {
  return <Services footer={<SiteFooter />} />;
}
