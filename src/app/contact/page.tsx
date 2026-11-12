import { pageMetadata } from "@/lib/seo";
import { SiteFooter } from "@/components/dom/SiteFooter";
import Contact from "./client";

export const metadata = pageMetadata({
  title: "Contact ZYXEN | Start Your Project",
  description: "Talk to ZYXEN about your website, software or automation project. Email contact@zyxen.in.",
  path: "/contact",
  absoluteTitle: true,
});

export default function Page() {
  return <Contact footer={<SiteFooter />} />;
}
