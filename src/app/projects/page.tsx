import { pageMetadata } from "@/lib/seo";
import { SiteFooter } from "@/components/dom/SiteFooter";
import { siteContent } from "@/content/site";
import { SITE_URL } from "@/lib/site";
import Projects from "./client";

export const metadata = pageMetadata({
  title: "Projects | ZYXEN Software & Web Work",
  description: "Selected ZYXEN projects: exam portals, finance systems, sales management, ERP and high-performance websites.",
  path: "/projects",
  absoluteTitle: true,
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Projects",
      item: `${SITE_URL}/projects`,
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Projects projects={siteContent.projects} footer={<SiteFooter />} />
    </>
  );
}
