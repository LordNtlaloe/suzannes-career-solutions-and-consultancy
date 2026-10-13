import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "./globals.css";

import { cn } from "@/lib/utils";
import { ThemeScript } from "@/components/theme-script";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "STEP — Skills, Talent & Employment Pathway",
  description:
    "An opportunity pathway for Basotho talent. A proposed youth-led, non-profit institution connecting Basotho talent to learning, mentorship, supervised experience and markets.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const appearance = cookieStore.get("appearance")?.value ?? "system";

  const fontStyles = {
    "--font-poppins": '"Poppins", sans-serif',
    "--font-dm": '"DM Sans", sans-serif',
    colorScheme: appearance === "dark" ? "dark" : "light",
  } as CSSProperties;

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        appearance === "dark" && "dark",
      )}
      style={fontStyles}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}