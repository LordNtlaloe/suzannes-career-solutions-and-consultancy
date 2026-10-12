import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { portfolio } from "@/lib/data";
import { SectionHeadingRow } from "./section-heading-row";

export function PortfolioSection() {
    return (
        <section id="portfolio" className="pt-[65px] pb-[110px]">
            <div className="container-x">
                <SectionHeadingRow
                    heading={
                        <>
                            Four programmes
                            <br />
                            one pathway
                        </>
                    }
                    action={
                        <Link
                            href="/apply"
                            className="text-link-brand transition-opacity hover:opacity-70"
                        >
                            Apply to STEP
                            <ArrowRight size={16} />
                        </Link>
                    }
                />

                <div className="mt-[44px] grid grid-cols-1 gap-[30px] md:grid-cols-2 lg:grid-cols-4">
                    {portfolio.map((item, index) => (
                        <Link
                            key={item.slug}
                            href="/apply"
                            className="group relative h-[478px] overflow-hidden max-[520px]:h-[400px]"
                        >
                            <img
                                src={item.image}
                                alt=""
                                className="transition-transform duration-[400ms] group-hover:scale-[1.04]"
                            />

                            {index === 1 && (
                                <div className="absolute bottom-[12px] left-[12px] right-[12px] flex min-h-[88px] items-center justify-between bg-white py-[15px] pl-[18px] pr-[14px] dark:bg-[#242527]">
                                    <div>
                                        <strong className="block text-[13px]">
                                            {item.title}
                                        </strong>
                                        <small className="mt-[5px] block text-[9px] text-[#aaa]">
                                            {item.status}
                                        </small>
                                    </div>

                                    <span className="grid h-[50px] w-[50px] place-items-center bg-blue-dark text-white">
                                        <ArrowRight size={22} />
                                    </span>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}