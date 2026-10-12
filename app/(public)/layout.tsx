import { SiteFooter } from "@/components/public/site-footer";
import { SiteNav } from "@/components/public/site-nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STEP — Skills, Talent & Employment Pathway",
  description:
    "An opportunity pathway for Basotho talent — four connected programmes linking learning, mentorship, supervised experience and markets.",
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
