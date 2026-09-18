"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, House, UserRound } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/teach", label: "Teach", icon: BookOpen },
  { href: "/account", label: "Account", icon: UserRound },
];

export function Navigation() {
  const pathname = usePathname();
  if (pathname === "/onboarding") return null;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:z-50 focus:bg-background focus:p-4">
        Skip to content
      </a>
      <nav className="mobile-nav" aria-label="Main navigation">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? ["/", "/recordings"].includes(pathname) : pathname === href || (href === "/teach" && pathname === "/results");
          return (
            <Link key={href} href={href} aria-label={label} aria-current={active ? "page" : undefined} className={cn("nav-link", active && "active")}>
              <motion.span animate={{ scale: active ? 1.06 : 1 }} whileTap={{ scale: 0.92 }}>
                <Icon size={27} strokeWidth={1.65} fill={active && href === "/" ? "currentColor" : "none"} />
              </motion.span>
              <span className="sr-only">{label}</span>
              <span className="nav-indicator" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
