import Link from "next/link";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { listPartners } from "@/db/queries/step/partners";
import { PartnerForm } from "@/components/step/partner-form";
import { stepPath } from "@/lib/step/config";

export default async function PartnersIndexPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    await getStepAccessContext(); // auth enforced by the layout
    const partners = await listPartners();

    return (
        <div className="flex flex-col gap-6">
            <PartnerForm />

            {partners.length === 0 ? (
                <p className="rounded-lg border border-line bg-light/60 p-8 text-center section-copy">
                    No partners recorded yet.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {partners.map((p) => (
                        <Link
                            key={p.id}
                            href={link(`/partners/${p.id}`)}
                            className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-line bg-card px-4 py-3 transition-colors hover:border-blue/40"
                        >
                            <p className="text-[14px] font-semibold">{p.name}</p>
                            {p.contact_email ? (
                                <span className="text-[12px] text-brand-muted">{p.contact_email}</span>
                            ) : null}
                            <span
                                className={`ml-auto rounded-full px-3 py-1 text-[11px] font-semibold ${
                                    p.status === "approved"
                                        ? "bg-blue/12 text-blue-dark"
                                        : "bg-light text-brand-muted"
                                }`}
                            >
                                {p.status}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
