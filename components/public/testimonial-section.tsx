import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { images } from "@/lib/data";

export function TestimonialSection() {
    return (
        <section className="pb-[100px]">
            <div className="container-x grid min-h-[566px] grid-cols-1 gap-[85px] bg-hero-grad p-[65px_60px] text-white shadow-[0_10px_15px_rgba(0,0,0,.08)] max-[1100px]:gap-[45px] md:grid-cols-2 max-md:p-[45px_30px]">
                {/* Person + quote card */}
                <div className="relative pl-[20px] max-md:pl-0">
                    <img
                        src={images.client}
                        alt="STEP participant"
                        className="h-[344px] w-[269px] max-md:w-[230px]"
                    />

                    <div className="absolute -bottom-[5px] left-[138px] min-h-[171px] w-[263px] bg-white px-[22px] pb-[18px] pt-[44px] text-ink max-md:left-[115px] dark:bg-[#242527] dark:text-[#f6f6f6]">
                        <div className="absolute -top-[31px] left-1/2 grid h-[62px] w-[62px] -translate-x-1/2 place-items-center rounded-full bg-white text-[38px] text-blue-dark shadow-quote dark:bg-[#242527]">
                            “
                        </div>

                        <strong className="block text-center text-[17px]">
                            Reitumetse Khabo
                        </strong>

                        <p className="mt-[12px] text-[10px] leading-[1.7] text-[#888] dark:text-[#9ca3af]">
                            STEP gave structure to skills I already had. I finished
                            with a verified passport and real introductions &mdash;
                            not just a certificate.
                        </p>
                    </div>
                </div>

                {/* Copy + controls */}
                <div>
                    <h2 className="text-[36px] font-semibold leading-[1.5]">
                        What we have done &amp;
                        <br />
                        what our participants say
                    </h2>

                    <p className="mt-[32px] max-w-[465px] text-[13px] leading-[1.8] text-[#c4c4c4]">
                        We help Basotho participants move from potential to
                        verified, opportunity-ready skill. See how cohorts have
                        used learning, practice and assessment to make real
                        progress.
                    </p>

                    <div className="mt-[75px] flex justify-end gap-[12px]">
                        <Link
                            href="/"
                            aria-label="Previous"
                            className="grid h-[57px] w-[57px] place-items-center bg-blue-dark text-white transition-opacity hover:opacity-80"
                        >
                            <ArrowRight size={20} className="rotate-180" />
                        </Link>

                        <Link
                            href="/contact"
                            aria-label="Next"
                            className="grid h-[57px] w-[57px] place-items-center bg-blue-dark text-white transition-opacity hover:opacity-80"
                        >
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}