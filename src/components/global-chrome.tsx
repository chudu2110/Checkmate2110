"use client";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";

export default function GlobalChrome() {
  const pathname = usePathname();
  const isIntro = pathname === "/intro" || pathname === "/intro/" || pathname.startsWith("/intro");

  if (isIntro) return null;

  return (
    <>
      <div className="fixed top-4 left-4 z-50 select-none font-semibold text-sm sm:text-base">
        Check Mate 2110
      </div>
      <ThemeToggle />
    </>
  );
}