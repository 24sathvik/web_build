import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { solutions } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { SolutionPageLayout } from "@/components/dom/solutions/SolutionPageLayout";

const solution = solutions.find((s) => s.slug === "fee-and-finance-software-for-academies")!;

export const metadata: Metadata = pageMetadata({
  title: solution.metaTitle,
  description: solution.metaDescription,
  path: solution.path,
  noindex: solution.status === "draft",
  absoluteTitle: true,
});

export default function FeeAndFinanceSoftwarePage() {
  if (!solution) notFound();
  return <SolutionPageLayout solution={solution} />;
}
