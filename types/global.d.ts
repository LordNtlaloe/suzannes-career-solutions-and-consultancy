// ./types/global.d.ts (or wherever this file lives)
import type { Auth } from "@/types/auth";

declare module "react" {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}