"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import type { FlashToast } from "@/types/ui";

export function useFlashToast(): void {
    useEffect(() => {
        const handleFlash = (event: Event) => {
            const flash = (event as CustomEvent<{
                flash?: {
                    toast?: FlashToast;
                };
            }>).detail?.flash;

            const data = flash?.toast;

            if (!data) {
                return;
            }

            toast[data.type](data.message);
        };

        window.addEventListener("flash", handleFlash);

        return () => {
            window.removeEventListener("flash", handleFlash);
        };
    }, []);
}
