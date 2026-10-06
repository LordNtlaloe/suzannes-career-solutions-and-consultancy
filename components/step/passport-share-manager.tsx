"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Link2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    createPassportShareAction,
    revokePassportShareAction,
} from "@/actions/step/passports.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useStepPath } from "@/components/step/step-path-provider";
import { PASSPORT_ENTRY_TYPES } from "@/lib/step/constants";

type Share = {
    id: string;
    token: string;
    scope: string;
    fields: string | null;
    expires_at: number | null;
    revoked_at: number | null;
    created_at: number;
};

export function PassportShareManager({
    passportId,
    shares,
}: {
    passportId: string;
    shares: Share[];
}) {
    const { path } = useStepPath();
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [scope, setScope] = useState<"limited" | "full">("limited");
    const [fields, setFields] = useState<string[]>([]);
    const [expiresInDays, setExpiresInDays] = useState("30");

    function toggleField(value: string) {
        setFields((prev) =>
            prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value],
        );
    }

    function createShare() {
        setError(null);
        startTransition(async () => {
            try {
                const expiresAt = expiresInDays
                    ? Math.floor(Date.now() / 1000) + Number(expiresInDays) * 86400
                    : null;
                const result = await createPassportShareAction({
                    passportId,
                    scope,
                    fields,
                    expiresAt,
                });
                const url = `${window.location.origin}${path(`/passport/${result.token}`)}`;
                await navigator.clipboard.writeText(url);
                toast.success("Share link copied to clipboard");
                router.refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    function revoke(shareId: string) {
        setError(null);
        startTransition(async () => {
            try {
                await revokePassportShareAction({ shareId });
                toast.success("Share revoked");
                router.refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    const activeShares = shares.filter((s) => !s.revoked_at);

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-[11px] text-destructive">
                    {error}
                </p>
            )}

            <div className="flex flex-col gap-3 rounded-md border border-line bg-card p-4">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-semibold">Share scope</Label>
                    <select
                        value={scope}
                        onChange={(e) => setScope(e.target.value as "limited" | "full")}
                        className="h-9 rounded-md border border-input bg-input/20 px-2 text-[12px] outline-none"
                    >
                        <option value="limited">Limited — selected achievements only</option>
                        <option value="full">Full — all verified achievements</option>
                    </select>
                </div>

                {scope === "limited" && (
                    <div className="flex flex-col gap-2">
                        <Label className="text-[11px] font-semibold">
                            Include achievement types{" "}
                            <span className="font-normal text-brand-muted">
                                (none = identity and status only)
                            </span>
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {PASSPORT_ENTRY_TYPES.map((t) => (
                                <label
                                    key={t.value}
                                    className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-[12px]"
                                >
                                    <input
                                        type="checkbox"
                                        checked={fields.includes(t.value)}
                                        onChange={() => toggleField(t.value)}
                                        className="size-3.5 accent-blue"
                                    />
                                    {t.label}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-semibold">Expires after (days)</Label>
                    <input
                        type="number"
                        min={1}
                        value={expiresInDays}
                        onChange={(e) => setExpiresInDays(e.target.value)}
                        className="h-9 rounded-md border border-input bg-input/20 px-2 text-[12px] outline-none"
                    />
                </div>

                <Button
                    type="button"
                    size="sm"
                    className="self-start"
                    disabled={pending}
                    onClick={createShare}
                >
                    <Link2 className="mr-1.5 size-3.5" />
                    Create share link
                </Button>
            </div>

            {activeShares.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {activeShares.map((s) => (
                        <div
                            key={s.id}
                            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-line bg-card px-4 py-2.5"
                        >
                            <span className="text-[12px] font-semibold">{s.scope}</span>
                            <span className="text-[12px] text-brand-muted">
                                {s.expires_at
                                    ? `expires ${new Date(Number(s.expires_at) * 1000).toLocaleDateString()}`
                                    : "no expiry"}
                            </span>
                            <div className="ml-auto flex items-center gap-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Copy share link"
                                    onClick={() => {
                                        const url = `${window.location.origin}${path(`/passport/${s.token}`)}`;
                                        navigator.clipboard.writeText(url);
                                        toast.success("Share link copied");
                                    }}
                                >
                                    <Copy className="size-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Revoke share"
                                    className="text-destructive hover:text-destructive"
                                    disabled={pending}
                                    onClick={() => revoke(s.id)}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
