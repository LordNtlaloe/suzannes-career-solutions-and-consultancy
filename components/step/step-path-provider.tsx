"use client";

import { createContext, useContext } from "react";

type StepPathContextValue = {
    /** STEP is hosted at the root, so this is "" (paths are absolute). */
    basePath: string;
    /** path("/apply") → "/apply". */
    path: (path: string) => string;
};

const StepPathContext = createContext<StepPathContextValue>({
    basePath: "",
    path: (p) => (p === "/" ? "/" : p),
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
