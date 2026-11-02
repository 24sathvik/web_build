import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { siteContent } from "@/content/site";
import AviationClient from "./client";

export const metadata = pageMetadata({
  title: "Aviation Academy Software India | Exam Portal, Fee & ERP | ZYXEN",
  description:
    "Specialized software for aviation academies: pilot mock exam portals configured for DGCA, FAA and EASA, student fee management, admissions pipelines, and institute ERP.",
  path: "/aviation-academy-software",
  absoluteTitle: true,
});

export default function AviationAcademyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${SITE_URL}/aviation-academy-software#service`,
        name: "Aviation Academy Software",
        description:
          "Specialized pilot mock exam portal, student fee and finance system, enquiry-to-enrolment pipeline, and institute ERP platform for aviation training academies.",
        provider: { "@id": `${SITE_URL}/#organization` },
        serviceType: "Aviation Educational Software Development",
        areaServed: {
          "@type": "Country",
          name: "India",
        },
        url: `${SITE_URL}/aviation-academy-software`,
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/aviation-academy-software#faq`,
        mainEntity: siteContent.aviation.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AviationClient />
    </>
  );
}
