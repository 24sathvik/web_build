import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => {
      const isHome = item.href === "/";
      const itemUrl = item.href
        ? isHome
          ? SITE_URL
          : `${SITE_URL}${item.href}`
        : undefined;

      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        ...(itemUrl ? { item: itemUrl } : {}),
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`inline-flex items-center text-xs md:text-sm font-mono text-[#BFC7D5] ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
                {index > 0 && (
                  <span className="text-white/30 select-none text-xs" aria-hidden="true">
                    /
                  </span>
                )}
                {isLast || !item.href ? (
                  <span
                    aria-current="page"
                    className="text-[#00D9FF] font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md inline-block"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="hover:text-white transition-colors underline-offset-4 hover:underline inline-flex items-center min-h-[44px] py-1"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

