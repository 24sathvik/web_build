"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected root errors to client console for diagnostics
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en-IN" className="h-full dark">
      <body className="min-h-full flex flex-col justify-center items-center bg-[#050505] text-white selection:bg-[#00D9FF] selection:text-black px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(239,68,68,0.1),transparent_70%)]"
        />

        <div className="relative z-10 max-w-xl w-full text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-mono uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            System Exception &bull; Runtime Error
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4">
            Something Went Wrong
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8">
            An unexpected error occurred during page rendering. Our engineering team has been notified. You can try refreshing the page or returning home.
          </p>

          {error.digest && (
            <div className="mb-8 p-3 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
              Error Digest: <span className="text-gray-200">{error.digest}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300 shadow-[0_0_20px_rgba(0,217,255,0.3)] cursor-pointer"
            >
              Refresh Application
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 bg-white/5"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

