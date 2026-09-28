import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeScript } from "@/components/theme-script";
import { cookies } from "next/headers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "General Project — Career Agency",
  description:
    "We help ambitious professionals make clearer career decisions and move toward opportunities that fit their next chapter.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const appearance = cookieStore.get("appearance")?.value ?? "system";

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        poppins.variable,
        dmSans.variable,
        appearance === "dark" && "dark",
      )}
      style={{ colorScheme: appearance === "dark" ? "dark" : "light" }}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}