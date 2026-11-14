import { pageMetadata } from "@/lib/seo";
import { SiteFooter } from "@/components/dom/SiteFooter";
import { SITE_URL } from "@/lib/site";
import Technology from "./client";

export const metadata = pageMetadata({
  title: "Technology | How ZYXEN Builds Fast, Scalable Software",
  description: "The modern stack ZYXEN uses to build fast, secure and scalable web platforms and business software.",
  path: "/technology",
  absoluteTitle: true,
});

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/technology#service`,
    name: "Software Architecture & Cloud Engineering",
    serviceType: "Cloud Infrastructure, System Architecture & Software Engineering",
    description: "Modern web architecture, microservices, containerization, and edge-native deployments designed for extreme speed and high availability.",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    url: `${SITE_URL}/technology`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Technology footer={<SiteFooter />} />
    </>
  );
}
