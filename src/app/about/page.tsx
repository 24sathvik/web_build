import { pageMetadata } from "@/lib/seo";
import { SiteFooter } from "@/components/dom/SiteFooter";
import About from "./client";

export const metadata = pageMetadata({
  title: "About ZYXEN | Digital Solutions & Creative Agency in Hyderabad",
  description: "Meet ZYXEN, the Hyderabad team building high-performance websites, software and automation for businesses and aviation academies.",
  path: "/about",
  absoluteTitle: true,
});

export default function Page() {
  return <About footer={<SiteFooter />} />;
}
