"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { consentIntroductionAction } from "@/actions/step/introductions.actions";
import { Button } from "@/components/ui/button";

export function IntroductionConsent({
    introductionId,
    status,
}: {
    introductionId: string;
    status: string;
}) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    function consent(ok: boolean) {
        startTransition(async () => {
            try {
                await consentIntroductionAction({ introductionId, consent: ok });
                toast.success(ok ? "Consent recorded" : "Introduction declined");
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    if (status !== "requested") {
        return <span className="text-[12px] text-brand-muted">{status}</span>;
    }

    return (
        <div className="flex gap-2">
            <Button type="button" size="sm" disabled={pending} onClick={() => consent(true)}>
                Consent
            </Button>
            <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => consent(false)}
            >
                Decline
            </Button>
        </div>
    );
}
