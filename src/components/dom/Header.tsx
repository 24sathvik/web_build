"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Package, Cpu, Briefcase, Mail } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "About", path: "/about", icon: Info },
    { name: "Services", path: "/services", icon: Package },
    { name: "Tech", path: "/technology", icon: Cpu },
    { name: "Projects", path: "/projects", icon: Briefcase },
    { name: "Contact", path: "/contact", icon: Mail },
  ];

  return (
    <>
      {/* Top Left Logo */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 pointer-events-none">
        <span className="pointer-events-auto text-2xl font-bold tracking-[0.2em] text-[#FFFFFF] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] cursor-pointer">
          <Link href="/">ZYXEN</Link>
        </span>
      </div>

      {/* Liquid Glass Bottom Nav Bar */}
      <header className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <nav 
          className="flex items-center gap-1 sm:gap-2 p-2 rounded-[2rem] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.3)"
          }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={clsx(
                  "relative flex flex-col items-center justify-center w-[72px] h-[72px] rounded-[1.5rem] transition-all duration-500 overflow-hidden",
                  isActive ? "text-[#FFFFFF]" : "text-[#BFC7D5] hover:text-[#FFFFFF]"
                )}
              >
                {/* Active Background Glow */}
                <div
                  className={clsx(
                    "absolute inset-0 transition-opacity duration-500",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                  style={{
                    background: "linear-gradient(180deg, rgba(0, 217, 255, 0.2) 0%, rgba(110, 91, 255, 0.05) 100%)",
                    boxShadow: "inset 0 1px 1px rgba(0, 217, 255, 0.3)"
                  }}
                />
                
                <item.icon 
                  size={22} 
                  strokeWidth={isActive ? 2 : 1.5} 
                  className={clsx("mb-1.5 relative z-10 transition-transform duration-300", isActive && "scale-110")} 
                />
                <span className="text-[10px] font-medium tracking-wider relative z-10">
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
