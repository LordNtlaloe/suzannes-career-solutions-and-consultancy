"use client";

import { useEffect, useState } from "react";

export function NavShell({ children }: { children: React.ReactNode }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={[
                "fixed inset-x-0 top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "bg-[#222]/90 shadow-[0_4px_20px_rgba(0,0,0,.15)] backdrop-blur-md"
                    : "bg-transparent",
            ].join(" ")}
        >
            {children}
        </header>
    );
}