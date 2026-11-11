"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Info, 
  Package, 
  Cpu, 
  Briefcase, 
  Mail, 
  BookOpen, 
  Plane,
  MoreHorizontal,
  X
} from "lucide-react";
import { siteContent } from "@/content/site";

const iconMap: Record<string, typeof Home> = {
  "/": Home,
  "/aviation-academy-software": Plane,
  "/about": Info,
  "/services": Package,
  "/technology": Cpu,
  "/projects": Briefcase,
  "/blogs": BookOpen,
  "/contact": Mail,
};

export function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const navItems = siteContent.navItems.map((item) => ({
    name: item.name,
    path: item.path,
    icon: iconMap[item.path] || Home,
  }));

  // Mobile bottom bar: 4 items + "More"
  const mobilePrimaryItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Services", path: "/services", icon: Package },
    { name: "Projects", path: "/projects", icon: Briefcase },
    { name: "Contact", path: "/contact", icon: Mail },
  ];

  // Mobile sheet items: About, Technology, Aviation, Blogs
  const mobileSheetItems = [
    { name: "Aviation Academy", path: "/aviation-academy-software", icon: Plane, desc: "DGCA/FAA exam portals & ERP" },
    { name: "About ZYXEN", path: "/about", icon: Info, desc: "Principles & Hyderabad agency" },
    { name: "Technology", path: "/technology", icon: Cpu, desc: "Next.js, performance & security" },
    { name: "Blogs & Insights", path: "/blogs", icon: BookOpen, desc: "Guides, costs & architectures" },
  ];

  const isMoreActive = mobileSheetItems.some((item) => item.path === pathname);

  return (
    <>
      {/* Top Left Logo */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 md:p-8 pointer-events-none flex items-center justify-between">
        <Link href="/" className="pointer-events-auto inline-block p-1">
          <img
            src="/images/logo-top.png"
            alt="Zyxen Logo"
            width={52}
            height={40}
            decoding="async"
            fetchPriority="low"
            className="h-7 sm:h-8 md:h-10 w-auto object-contain cursor-pointer"
          />
        </Link>
      </div>

      {/* ======================================================== */}
      {/* Desktop / Tablet Navigation (>= 768px): Liquid Glass Pill */}
      {/* ======================================================== */}
      <header className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[95vw] overflow-x-auto no-scrollbar">
        <nav 
          className="flex items-center gap-1 p-2 rounded-[2rem] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.3)"
          }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={clsx(
                  "relative flex flex-col items-center justify-center w-[68px] md:w-[72px] h-[68px] md:h-[72px] rounded-[1.2rem] md:rounded-[1.5rem] transition-all duration-300 overflow-hidden flex-shrink-0",
                  isActive ? "text-[#FFFFFF]" : "text-[#BFC7D5] hover:text-[#FFFFFF]"
                )}
              >
                {/* Active Background Glow */}
                <div
                  className={clsx(
                    "absolute inset-0 transition-opacity duration-300",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                  style={{
                    background: "linear-gradient(180deg, rgba(0, 217, 255, 0.2) 0%, rgba(110, 91, 255, 0.05) 100%)",
                    boxShadow: "inset 0 1px 1px rgba(0, 217, 255, 0.3)"
                  }}
                />
                
                <IconComponent 
                  size={20} 
                  strokeWidth={isActive ? 2 : 1.5} 
                  className={clsx("mb-1 relative z-10 transition-transform duration-300", isActive && "scale-110 text-[#00D9FF]")} 
                />
                <span className="text-[10px] font-medium tracking-wider relative z-10 truncate max-w-[62px] text-center">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ======================================================== */}
      {/* Mobile Navigation (< 768px): 4-Item Bar + Thumb "More" Sheet */}
      {/* ======================================================== */}
      <div className="md:hidden">
        {/* Backdrop for More Sheet */}
        {isSheetOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsSheetOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* More Bottom Sheet */}
        {isSheetOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Additional Navigation"
            className="fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-50 bg-[#0d0f17]/95 backdrop-blur-2xl border-t border-white/15 rounded-t-2xl p-4 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-250 max-h-[75svh] overflow-y-auto"
          >
            {/* Sheet Handle */}
            <div className="w-10 h-1 bg-white/25 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
              <span className="text-xs uppercase tracking-widest text-[#BFC7D5] font-semibold">
                More Sections
              </span>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-white rounded-lg -mr-2"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {mobileSheetItems.map((item) => {
                const isActive = pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsSheetOpen(false)}
                    className={clsx(
                      "min-h-[48px] flex items-center gap-3.5 p-3 rounded-xl border transition-all duration-200",
                      isActive
                        ? "bg-[#00D9FF]/10 border-[#00D9FF]/40 text-white"
                        : "bg-white/[0.03] border-white/5 text-[#BFC7D5] hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                        isActive ? "bg-[#00D9FF]/20 text-[#00D9FF]" : "bg-white/5 text-white/80"
                      )}
                    >
                      <IconComponent size={18} strokeWidth={isActive ? 2 : 1.5} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium text-white truncate">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-[#8F9CAE] truncate">
                        {item.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Fixed Mobile Bottom Bar */}
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#090a10]/95 border-t border-white/10 shadow-[0_-5px_30px_rgba(0,0,0,0.7)] px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
        >
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {mobilePrimaryItems.map((item) => {
              const isActive = pathname === item.path;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={clsx(
                    "min-w-[44px] min-h-[44px] flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors",
                    isActive ? "text-[#00D9FF]" : "text-[#8F9CAE] hover:text-white"
                  )}
                >
                  <IconComponent size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                  <span className="text-[10px] font-medium tracking-tight mt-0.5">
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* "More" Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSheetOpen((prev) => !prev)}
              aria-expanded={isSheetOpen}
              className={clsx(
                "min-w-[44px] min-h-[44px] flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors",
                isSheetOpen || isMoreActive ? "text-[#00D9FF]" : "text-[#8F9CAE] hover:text-white"
              )}
            >
              <MoreHorizontal size={20} strokeWidth={isSheetOpen || isMoreActive ? 2.2 : 1.6} />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">
                More
              </span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}

