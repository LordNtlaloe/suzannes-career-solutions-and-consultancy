import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { images } from "@/lib/data";

export function Invitation() {
    return (
        <section className="container-x py-16 sm:py-20">
            <div className="grid grid-cols-1 items-center overflow-hidden rounded-2xl border border-line bg-linear-to-br from-blue/10 via-card to-muted shadow-soft lg:grid-cols-2">
                <img
                    src={images.project4}
                    alt="Creative work and collaboration"
                    className="h-64 w-full object-cover lg:h-full"
                    loading="lazy"
                />
                <div className="p-8 text-center sm:p-12">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Invitation to collaborate
                    </span>
                    <h2 className="section-heading mt-3 leading-tight">
                        Co-design opportunities for Basotho talent.
                    </h2>
                    <p className="section-copy mx-auto mt-4 max-w-xl">
                        STEP invites institutions, employers, training providers,
                        creative industries, development partners and philanthropies to
                        collaborate — through expertise, mentorship, learning resources,
                        supervised experience, market access, grants or sponsorship.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <Link href="/apply" className="btn-brand inline-flex">
                            Apply to STEP
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center rounded-0 border border-line px-5 py-2.5 text-[12px] font-semibold text-brand transition-colors hover:border-[#c4c4c4]"
                        >
                            Partner with STEP
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
