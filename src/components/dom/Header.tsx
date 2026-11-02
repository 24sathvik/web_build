"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Package, Cpu, Briefcase, Mail, BookOpen, Plane } from "lucide-react";
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

  const navItems = siteContent.navItems.map((item) => ({
    name: item.name,
    path: item.path,
    icon: iconMap[item.path] || Home,
  }));

  return (
    <>
      {/* Top Left Logo */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 pointer-events-none">
        <Link href="/" className="pointer-events-auto inline-block">
          <img src="/images/logo-top.png" alt="Zyxen Logo" className="h-8 md:h-10 w-auto object-contain cursor-pointer" />
        </Link>
      </div>

      {/* Liquid Glass Bottom Nav Bar */}
      <header className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[95vw] overflow-x-auto no-scrollbar">
        <nav 
          className="flex items-center gap-1 p-1.5 md:p-2 rounded-[2rem] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
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
                  "relative flex flex-col items-center justify-center w-[58px] sm:w-[68px] md:w-[72px] h-[64px] md:h-[72px] rounded-[1.2rem] md:rounded-[1.5rem] transition-all duration-300 overflow-hidden flex-shrink-0",
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
                  className={clsx("mb-1 relative z-10 transition-transform duration-300", isActive && "scale-110")} 
                />
                <span className="text-[9px] md:text-[10px] font-medium tracking-wider relative z-10 truncate max-w-[60px] text-center">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
