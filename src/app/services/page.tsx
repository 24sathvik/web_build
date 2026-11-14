import { pageMetadata } from "@/lib/seo";
import { SiteFooter } from "@/components/dom/SiteFooter";
import { SITE_URL } from "@/lib/site";
import Services from "./client";

export const metadata = pageMetadata({
  title: "Services | ZYXEN – Web, Software, Automation & AI",
  description: "Web development, custom software, automation, exam portals, finance systems and ERP built by ZYXEN.",
  path: "/services",
  absoluteTitle: true,
});

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services#service`,
    name: "ZYXEN Digital Solutions & Software Engineering",
    serviceType: "Software Development, Web Design & Automation",
    description: "Custom software, exam engines, fee systems, and high-performance websites built for aviation academies and growing businesses.",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    url: `${SITE_URL}/services`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Engineering & Digital Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "High-Performance Web Platforms",
            description: "Custom web development using Next.js and modern cloud infrastructure.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Aviation Academy Software & Mock Exam Portals",
            description: "Custom test prep and ERP systems for DGCA, FAA and EASA pilot training institutes.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Pharma & Manufacturing Batch Tracking Systems",
            description: "Digital lot traceability, production batch records, and inventory software.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Business Workflow Automation & Quotation Engines",
            description: "Automated billing, quotation engines, and customer inquiry management.",
          },
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Services footer={<SiteFooter />} />
    </>
  );
}
