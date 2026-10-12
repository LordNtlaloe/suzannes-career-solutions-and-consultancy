import { SiteFooter } from "@/components/public/site-footer";
import { SiteNav } from "@/components/public/site-nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STEP — Skills, Talent & Employment Pathway",
  description:
    "A six-month industry-based incubation and opportunity pathway for 600+ Basotho participants.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (


    <main className="min-h-full flex flex-col">
      <SiteNav />
      {children}
      <SiteFooter />
    </main>

  );
}
