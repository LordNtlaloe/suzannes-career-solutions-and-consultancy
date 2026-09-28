"use client";

import { usePathname } from "next/navigation";

export type IsCurrentUrlFn = (
    urlToCheck: string,
    currentUrl?: string,
    startsWith?: boolean,
) => boolean;

export type IsCurrentOrParentUrlFn = (
    urlToCheck: string,
    currentUrl?: string,
) => boolean;

export type WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
    urlToCheck: string,
    ifTrue: TIfTrue,
    ifFalse?: TIfFalse,
) => TIfTrue | TIfFalse;

export type UseCurrentUrlReturn = {
    currentUrl: string;
    isCurrentUrl: IsCurrentUrlFn;
    isCurrentOrParentUrl: IsCurrentOrParentUrlFn;
    whenCurrentUrl: WhenCurrentUrlFn;
};

export function useCurrentUrl(): UseCurrentUrlReturn {
    const pathname = usePathname();

    const currentUrlPath = pathname ?? "/";

    const isCurrentUrl: IsCurrentUrlFn = (
        urlToCheck,
        currentUrl,
        startsWith = false,
    ) => {
        const urlToCompare = currentUrl ?? currentUrlPath;

        let urlString = urlToCheck;

        // Handle absolute URLs.
        if (urlString.startsWith("http")) {
            try {
                urlString = new URL(urlString).pathname;
            } catch {
                return false;
            }
        }

        // Remove query strings and hashes.
        urlString = urlString.split("?")[0].split("#")[0];

        const comparePath = startsWith
            ? urlToCompare.startsWith(urlString)
            : urlString === urlToCompare;

        return comparePath;
    };

    const isCurrentOrParentUrl: IsCurrentOrParentUrlFn = (
        urlToCheck,
        currentUrl,
    ) => {
        return isCurrentUrl(urlToCheck, currentUrl, true);
    };

    const whenCurrentUrl: WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
        urlToCheck: string,
        ifTrue: TIfTrue,
        ifFalse: TIfFalse = null as TIfFalse,
    ): TIfTrue | TIfFalse => {
        return isCurrentUrl(urlToCheck) ? ifTrue : ifFalse;
    };

    return {
        currentUrl: currentUrlPath,
        isCurrentUrl,
        isCurrentOrParentUrl,
        whenCurrentUrl,
    };
}