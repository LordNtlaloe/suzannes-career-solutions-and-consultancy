"use client";

import { useCallback, useState } from "react";

export type UseTwoFactorAuthReturn = {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    recoveryCodesList: string[];
    hasSetupData: boolean;
    errors: string[];

    clearErrors: () => void;
    clearSetupData: () => void;
    clearTwoFactorAuthData: () => void;

    fetchQrCode: () => Promise<void>;
    fetchSetupKey: () => Promise<void>;
    fetchSetupData: () => Promise<void>;
    fetchRecoveryCodes: () => Promise<void>;
};

export const OTP_MAX_LENGTH = 6;

const TWO_FACTOR_ROUTES = {
    qrCode: "/two-factor/qr-code",
    secretKey: "/two-factor/secret-key",
    recoveryCodes: "/two-factor/recovery-codes",
} as const;

async function post<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export const useTwoFactorAuth = (): UseTwoFactorAuthReturn => {
    const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
    const [manualSetupKey, setManualSetupKey] = useState<string | null>(null);
    const [recoveryCodesList, setRecoveryCodesList] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    const hasSetupData =
        qrCodeSvg !== null && manualSetupKey !== null;

    const clearErrors = useCallback((): void => {
        setErrors([]);
    }, []);

    const clearSetupData = useCallback((): void => {
        setManualSetupKey(null);
        setQrCodeSvg(null);
        setErrors([]);
    }, []);

    const clearTwoFactorAuthData = useCallback((): void => {
        setManualSetupKey(null);
        setQrCodeSvg(null);
        setErrors([]);
        setRecoveryCodesList([]);
    }, []);

    const fetchQrCode = useCallback(async (): Promise<void> => {
        try {
            const { svg } = await post<{
                svg: string;
                url: string;
            }>(TWO_FACTOR_ROUTES.qrCode);

            setQrCodeSvg(svg);
        } catch {
            setErrors((prev) => [
                ...prev,
                "Failed to fetch QR code",
            ]);

            setQrCodeSvg(null);
        }
    }, []);

    const fetchSetupKey = useCallback(async (): Promise<void> => {
        try {
            const { secretKey: key } = await post<{
                secretKey: string;
            }>(TWO_FACTOR_ROUTES.secretKey);

            setManualSetupKey(key);
        } catch {
            setErrors((prev) => [
                ...prev,
                "Failed to fetch a setup key",
            ]);

            setManualSetupKey(null);
        }
    }, []);

    const fetchRecoveryCodes = useCallback(async (): Promise<void> => {
        try {
            setErrors([]);

            const codes = await post<string[]>(
                TWO_FACTOR_ROUTES.recoveryCodes,
            );

            setRecoveryCodesList(codes);
        } catch {
            setErrors((prev) => [
                ...prev,
                "Failed to fetch recovery codes",
            ]);

            setRecoveryCodesList([]);
        }
    }, []);

    const fetchSetupData = useCallback(async (): Promise<void> => {
        setErrors([]);

        const results = await Promise.allSettled([
            fetchQrCode(),
            fetchSetupKey(),
        ]);

        const failed = results.some(
            (result) => result.status === "rejected",
        );

        if (failed) {
            setQrCodeSvg(null);
            setManualSetupKey(null);
        }
    }, [fetchQrCode, fetchSetupKey]);

    return {
        qrCodeSvg,
        manualSetupKey,
        recoveryCodesList,
        hasSetupData,
        errors,

        clearErrors,
        clearSetupData,
        clearTwoFactorAuthData,

        fetchQrCode,
        fetchSetupKey,
        fetchSetupData,
        fetchRecoveryCodes,
    };
};