import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { images } from "@/lib/data";

export function TeamSection() {
    return (
        <section id="team" className="team-section bg-white py-[80px] pb-[100px]">
            <div className="container-x grid grid-cols-1 items-center gap-[80px] md:grid-cols-2">
                {/* Portrait + floating profile card */}
                <div className="relative h-[540px] w-full max-md:h-[470px]">
                    <img
                        src={images.consultant}
                        alt="Programme lead"
                        className="object-center"
                    />

                    <div className="absolute -right-[12px] bottom-[35px] min-h-[312px] w-[294px] bg-hero-grad p-[32px] text-center text-white shadow-soft">
                        <img
                            src={images.client}
                            alt=""
                            className="mx-auto mb-[20px] h-[100px] w-[100px] rounded-full object-top"
                        />

                        <strong className="block text-[20px]">Mammenyane Suzanne Motsoane</strong>

                        <p className="mt-[5px] text-[11px] text-[#ddd]">
                            Founder, STEP
                        </p>

                        <small className="mt-[20px] block text-[10px] leading-[1.7] text-[#e5e5e5]">
                            Founder of Suzanne&rsquo;s Career Solutions &amp;
                            Consultancy and the Career Excellence Youth Seminar.
                        </small>
                    </div>
                </div>

                {/* Copy */}
                <div className="feature-copy max-md:mt-[10px]">
                    <h2 className="text-[46px] font-semibold leading-[1.5] max-[520px]:text-[38px]">
                        Meet the founder
                        <br />
                        behind the programme
                    </h2>

                    <p className="mt-[25px] max-w-[470px] text-[14px] leading-[1.8] text-[#a1a1a1]">
                        STEP is a youth-led, non-profit institution built with
                        employers, mentors, schools and creative-industry
                        partners across Lesotho.
                    </p>

                    <div className="mt-[34px] flex items-center gap-[30px]">
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
            </div>
        </section>
    );
}