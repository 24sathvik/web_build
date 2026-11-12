"use client";

export function BackToTopButton() {
  const handleScrollTop = () => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";

    const scrollContainer = document.querySelector<HTMLElement>('[id^="scroll-container"]');
    if (scrollContainer && scrollContainer.scrollTop > 0) {
      scrollContainer.scrollTo({ top: 0, behavior });
    }
    window.scrollTo({ top: 0, behavior });
  };

  return (
    <button
      type="button"
      onClick={handleScrollTop}
      aria-label="Back to top"
      className="min-h-[44px] inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-mono uppercase tracking-widest text-[#BFC7D5] hover:border-[#00D9FF]/50 hover:text-white transition-colors"
    >
      <span>Top</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}

