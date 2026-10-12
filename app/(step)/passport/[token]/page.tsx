import { getPassportShareView } from "@/db/queries/step/passports";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/passport",
        title: "Shared Skills Passport",
        description: "A verified STEP Skills Passport shared with you.",
        noIndex: true,
    });
}

export default async function SharedPassportPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const view = await getPassportShareView(token);

    if (!view) {
        return (
            <section className="container-x py-14 sm:py-20">
                <div className="mx-auto max-w-2xl rounded-lg border border-line bg-light/60 p-8 text-center">
                    <h1 className="section-heading">Share unavailable.</h1>
                    <p className="section-copy mt-3">
                        This link is invalid, expired or has been revoked.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="container-x py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
                <header className="mb-8 flex flex-col gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Skills Passport
                    </span>
                    <h1 className="section-heading">
                        {view.participantName ?? "Participant"}
                    </h1>
                    <p className="section-copy">
                        Status: {view.passportStatus}
                        {view.share.scope === "limited" ? " · limited share" : " · full share"}
                    </p>
                </header>

                {view.entries.length === 0 ? (
                    <p className="rounded-lg border border-line bg-light/60 p-8 text-center section-copy">
                        No verified achievements shared in this link.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {view.entries.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-0 border border-line bg-card px-4 py-3"
                            >
                                <p className="text-[14px] font-semibold">{entry.title}</p>
                                <span className="text-[12px] text-brand-muted">
                                    {entry.entry_type}
                                </span>
                                {entry.verified_at ? (
                                    <span className="ml-auto text-[11px] font-semibold text-blue-dark">
                                        Verified{" "}
                                        {new Date(Number(entry.verified_at) * 1000).toLocaleDateString()}
                                    </span>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
