import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { SiteFooter } from "@/components/dom/SiteFooter";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, STATIC_LAST_MODIFIED } from "@/lib/site";
import { siteContent } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy | ZYXEN",
  description:
    "How ZYXEN collects, delivers, stores, and handles inquiry data submitted through our website, and how to request deletion.",
  path: "/privacy-policy",
  absoluteTitle: true,
});

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-[100svh] w-full bg-[#050505] text-white cursor-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(0,217,255,0.12), transparent 70%)",
        }}
      />
      <CustomCursor />
      <Header />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 pt-28 md:pt-36 pb-16 md:pb-24">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00D9FF]">
          Legal &amp; Data Handling
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-white/60">
          Last updated:{" "}
          <time dateTime={STATIC_LAST_MODIFIED}>
            {new Date(STATIC_LAST_MODIFIED).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </p>

        {/* VERIFY: Review full privacy notice with legal counsel before production sign-off */}
        <div className="zy-prose mt-10 space-y-8 text-[#BFC7D5]">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Overview</h2>
            <p>
              ZYXEN respects your privacy. This policy explains in plain language
              what information is collected when you browse{" "}
              <Link href="/" className="text-[#00D9FF] hover:underline">
                zyxen.in
              </Link>{" "}
              or send us a project inquiry, how it is delivered to our team, and
              how you can ask us to update or delete it.
            </p>
          </section>

          <section className="space-y-3">
            {/* VERIFY: Confirm exact form fields across ContactOverlay and ContactForm */}
            <h2 className="text-xl font-bold text-white">
              2. Information Collected via Contact Forms
            </h2>
            <p>
              We do not require account registration to read our pages or explore
              our work. When you submit our contact or project inquiry form, we
              collect only the details you choose to enter — typically your name,
              email address, optional company or project details, and your message
              — solely so we can respond to your request.
            </p>
          </section>

          <section className="space-y-3">
            {/* VERIFY: Confirm EmailJS account retention/processing settings */}
            <h2 className="text-xl font-bold text-white">
              3. Message Delivery via EmailJS
            </h2>
            <p>
              To deliver contact form submissions reliably without maintaining a
              public database of form entries on this website, inquiry forms use
              EmailJS to transmit your message directly to our inbox at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#00D9FF] hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              . Your contact details are never sold, rented, or shared with
              third-party brokers or advertisers.
            </p>
          </section>

          <section className="space-y-3">
            {/* VERIFY: Analytics provider and toggle state in deployment environment */}
            <h2 className="text-xl font-bold text-white">
              4. Analytics &amp; Technical Telemetry
            </h2>
            <p>
              Aggregate website analytics, if enabled in our hosting or deployment
              configuration, are used strictly to measure page performance, load
              reliability, and general traffic trends. Where analytics are not
              enabled, no tracking scripts or advertising cookies are loaded.
            </p>
          </section>

          <section className="space-y-3">
            {/* VERIFY: Retention window and jurisdiction wording */}
            <h2 className="text-xl font-bold text-white">
              5. Data Retention &amp; Security
            </h2>
            <p>
              Correspondence received by email is retained only for as long as
              needed to discuss, deliver, or support your project inquiry, unless a
              longer period is required for contractual or accounting records.
            </p>
          </section>

          <section className="space-y-3">
            {/* VERIFY: Confirm deletion SLA and contact workflow */}
            <h2 className="text-xl font-bold text-white">
              6. Your Choices &amp; Deletion Requests
            </h2>
            <p>
              You may request access to, correction of, or deletion of any inquiry
              messages or contact details you have shared with us at any time by
              emailing{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Privacy%20%2F%20Data%20Deletion%20Request`}
                className="text-[#00D9FF] hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              . We will confirm and act on your request promptly.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-2">
            <h2 className="text-lg font-bold text-white">7. Contact ZYXEN</h2>
            <p className="text-sm">
              ZYXEN &bull; {siteContent.contact.address}
            </p>
            <p className="text-sm">
              Email:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#00D9FF] hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <div className="text-sm flex flex-wrap gap-x-4 gap-y-1">
              <span>Phone:</span>
              {siteContent.contact.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-white hover:text-[#00D9FF] transition-colors"
                >
                  {phone}
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

