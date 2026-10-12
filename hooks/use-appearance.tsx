"use client";

import { useSyncExternalStore } from "react";

export type ResolvedAppearance = "light" | "dark";

export type Appearance = ResolvedAppearance | "system";

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

const listeners = new Set<() => void>();

let currentAppearance: Appearance = "system";

const prefersDark = (): boolean => {
    if (typeof window === "undefined") {
        return false;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const setCookie = (
    name: string,
    value: string,
    days = 365,
): void => {
    if (typeof document === "undefined") {
        return;
    }

    const maxAge = days * 24 * 60 * 60;

    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = (): Appearance => {
    if (typeof window === "undefined") {
        return "system";
    }

    const stored = localStorage.getItem("appearance");

    if (
        stored === "light" ||
        stored === "dark" ||
        stored === "system"
    ) {
        return stored;
    }

    return "system";
};

const isDarkMode = (appearance: Appearance): boolean => {
    return (
        appearance === "dark" ||
        (appearance === "system" && prefersDark())
    );
};

const applyTheme = (appearance: Appearance): void => {
    if (typeof document === "undefined") {
        return;
    }

    const isDark = isDarkMode(appearance);

    document.documentElement.classList.toggle("dark", isDark);

    document.documentElement.style.colorScheme = isDark
        ? "dark"
        : "light";
};

const subscribe = (callback: () => void): (() => void) => {
    listeners.add(callback);

    return () => {
        listeners.delete(callback);
    };
};

const notify = (): void => {
    listeners.forEach((listener) => listener());
};

const mediaQuery = (): MediaQueryList | null => {
    if (typeof window === "undefined") {
        return null;
    }

    return window.matchMedia("(prefers-color-scheme: dark)");
};

const handleSystemThemeChange = (): void => {
    if (currentAppearance === "system") {
        applyTheme(currentAppearance);
        notify();
    }
};

export function initializeTheme(): void {
    if (typeof window === "undefined") {
        return;
    }

    const storedAppearance = getStoredAppearance();

    if (!localStorage.getItem("appearance")) {
        localStorage.setItem("appearance", "system");
        setCookie("appearance", "system");
    }

    currentAppearance = storedAppearance;

    applyTheme(currentAppearance);

    const query = mediaQuery();

    query?.removeEventListener(
        "change",
        handleSystemThemeChange,
    );

    query?.addEventListener(
        "change",
        handleSystemThemeChange,
    );
}

export function useAppearance(): UseAppearanceReturn {
    const appearance = useSyncExternalStore<Appearance>(
        subscribe,
        (): Appearance => currentAppearance,
        // Server/hydration snapshot. The server cannot read the OS preference
        // or localStorage, so it must be deterministic. "light" makes the
        // first client render match the server and avoids hydration mismatches
        // in theme toggles; the real value is adopted after hydration.
        (): Appearance => "light",
    );

    const resolvedAppearance: ResolvedAppearance = isDarkMode(
        appearance,
    )
        ? "dark"
        : "light";

    const updateAppearance = (mode: Appearance): void => {
        currentAppearance = mode;

        localStorage.setItem("appearance", mode);

        setCookie("appearance", mode);

        applyTheme(mode);

        notify();
    };

    return {
        appearance,
        resolvedAppearance,
        updateAppearance,
    };
}

// Sync the client-side store with the persisted theme before hydration so
// toggles and the appearance settings reflect the real value (the inline
// ThemeScript already applies the class, but not this store).
if (typeof window !== "undefined") {
    initializeTheme();
}
