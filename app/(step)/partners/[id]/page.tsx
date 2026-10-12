import { notFound } from "next/navigation";
import { getStepAccessContext } from "@/lib/step/permissions";
import {
    getPartnerById,
    listAgreements,
    listContributions,
} from "@/db/queries/step/partners";
import { PartnerManage } from "@/components/step/partner-manage";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/partners",
        title: "Partner",
        description: "Partner record and agreements.",
    });
}

export default async function PartnerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    await getStepAccessContext(); // auth enforced by the layout
    const partner = await getPartnerById(id);
    if (!partner) notFound();

    const [agreements, contributions] = await Promise.all([
        listAgreements(id),
        listContributions(id),
    ]);

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-line bg-card p-6">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h2 className="text-[16px] font-semibold">{partner.name}</h2>
                    <span className="text-[12px] text-brand-muted">{partner.contact_email ?? ""}</span>
                    <span
                        className={`ml-auto rounded-full px-3 py-1 text-[11px] font-semibold ${
                            partner.status === "approved"
                                ? "bg-blue/12 text-blue-dark"
                                : "bg-light text-brand-muted"
                        }`}
                    >
                        {partner.status}
                    </span>
                </div>
                {partner.website ? (
                    <p className="mt-1 text-[12px] text-brand-muted">{partner.website}</p>
                ) : null}
            </div>

            <PartnerManage partnerId={id} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                    <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                        Agreements ({agreements.length})
                    </h3>
                    <div className="flex flex-col gap-2">
                        {agreements.map((a) => (
                            <div
                                key={String(a.id)}
                                className="flex items-center justify-between rounded-0 border border-line bg-light/60 px-4 py-2.5"
                            >
                                <p className="text-[13px] font-semibold">{String(a.title)}</p>
                                <span className="text-[12px] text-brand-muted">{String(a.status)}</span>
                            </div>
                        ))}
                        {agreements.length === 0 && (
                            <p className="section-copy">No agreements yet.</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                        Contributions ({contributions.length})
                    </h3>
                    <div className="flex flex-col gap-2">
                        {contributions.map((c) => (
                            <div
                                key={String(c.id)}
                                className="flex items-center justify-between rounded-0 border border-line bg-light/60 px-4 py-2.5"
                            >
                                <div>
                                    <p className="text-[13px] font-semibold">{String(c.area)}</p>
                                    {c.description ? (
                                        <p className="text-[12px] text-brand-muted">{String(c.description)}</p>
                                    ) : null}
                                </div>
                                <span className="text-[12px] text-brand-muted">{String(c.status)}</span>
                            </div>
                        ))}
                        {contributions.length === 0 && (
                            <p className="section-copy">No contributions yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
