import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
    return (
        <div className="container-x py-20">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
                <Spinner className="size-6 text-blue" />
                <p className="section-copy">Loading your STEP workspace…</p>
            </div>
        </div>
    );
}
