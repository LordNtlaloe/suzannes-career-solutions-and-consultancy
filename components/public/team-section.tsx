import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { images } from "@/lib/data";

export function TeamSection() {
    return (
        <section id="team" className="team-section bg-white py-20 pb-25">
            <div className="container-x">
                {/* Copy */}
                <div className="feature-copy">
                    <h2 className="text-[46px] font-semibold leading-normal max-[520px]:text-[38px]">
                        Meet the co-founders
                        <br />
                        behind the programme
                    </h2>

                    <p className="mt-6.25 max-w-117.5 text-[14px] leading-[1.8] text-[#a1a1a1]">
                        STEP is a youth-led, non-profit institution built with
                        employers, mentors, schools and creative-industry
                        partners across Lesotho.
                    </p>

                    <div className="mt-8.5 flex items-center gap-7.5">
                        <Link href="/about" className="btn-brand">
                            About the programme
                        </Link>

                        <Link
                            href="/"
                            className="text-link-brand transition-opacity hover:opacity-70"
                        >
                            How STEP works
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Portraits + floating profile cards */}
                <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
                    <div className="relative h-135 w-full max-md:h-117.5">
                        <img
                            src={images.founderSuzanne}
                            alt="Mammenyane Suzanne Mots'oane"
                            className="object-center"
                        />

                        <div className="absolute -right-6 bottom-8.75 min-h-78 w-73.5 bg-blue-dark p-8 text-center text-white shadow-btn">
                            <img
                                src={images.founderSuzanne}
                                alt=""
                                className="mx-auto mb-2 h-32 w-32 rounded-full object-top"
                            />

                            <strong className="block text-[20px]">Mammenyane Suzanne Mots&rsquo;oane</strong>

                            <p className="mt-1.25 text-[11px] text-[#ddd]">
                                Co-founder, STEP
                            </p>

                            <small className="mt-5 block text-[10px] leading-[1.7] text-[#e5e5e5]">
                                Founder &amp; CEO of Suzanne&rsquo;s Career Solutions &amp;
                                Consultancy and the Career Excellence Youth Seminar.
                            </small>
                        </div>
                    </div>

                    <div className="relative h-135 w-full max-md:h-117.5">
                        <img
                            src={images.founderThabo}
                            alt="Thabo Maibi"
                            className="object-center"
                        />

                        <div className="absolute -right-6 bottom-8.75 min-h-78 w-73.5 bg-blue-dark p-8 text-center text-white shadow-btn">
                            <img
                                src={images.founderThabo}
                                alt=""
                                className="mx-auto mb-2 h-32 w-32 rounded-full object-top"
                            />

                            <strong className="block text-[20px]">Thabo Maibi</strong>

                            <p className="mt-1.25 text-[11px] text-[#ddd]">
                                Co-founder, STEP
                            </p>

                            <small className="mt-5 block text-[10px] leading-[1.7] text-[#e5e5e5]">
                                Engineer, AI researcher and founder of Career Agent,
                                an AI-powered career platform.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}