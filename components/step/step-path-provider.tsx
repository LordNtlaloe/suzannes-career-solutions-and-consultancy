"use client";

import { createContext, useContext } from "react";

type StepPathContextValue = {
    /** "" on the STEP subdomain, "/step" on the main domain. */
    basePath: string;
    /** stepPath("/apply") → "/step/apply" or "/apply" depending on host. */
    path: (path: string) => string;
};

const StepPathContext = createContext<StepPathContextValue>({
    basePath: "/step",
    path: (p) => `/step${p === "/" ? "" : p}`,
});

export function StepPathProvider({
    basePath,
    children,
}: {
    basePath: string;
    children: React.ReactNode;
}) {
    const value: StepPathContextValue = {
        basePath,
        path: (p) => {
            const clean = p.startsWith("/") ? p : `/${p}`;
            if (clean === "/") return basePath || "/";
            return `${basePath}${clean}`;
        },
    };

    return (
        <StepPathContext.Provider value={value}>
            {children}
        </StepPathContext.Provider>
    );
}

export function useStepPath() {
    return useContext(StepPathContext);
}
