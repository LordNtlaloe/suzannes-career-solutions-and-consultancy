import Link from "next/link";
import { images } from "@/lib/data";

export function StorySection() {
    return (
        <section id="about" className="py-[100px] dark:bg-[#1a1a1a]">
            <div className="container-x grid grid-cols-1 items-center gap-[70px] md:grid-cols-[.95fr_1.05fr]">
                {/* Copy */}
                <div>
                    <h2 className="section-heading">
                        Our Story
                        <br />
                        Who we are
                    </h2>

                    <p className="section-copy my-[30px] max-w-[550px]">
                        STEP was conceived by Mammenyane Suzanne Mots&rsquo;oane,
                        founder of Suzanne&rsquo;s Career Solutions &amp; Consultancy.
                        Through years of supporting job seekers, she saw that a
                        strong CV or a single coaching session could not overcome
                        missing skills, experience and networks. The annual Career
                        Excellence Youth Seminar proved the value of bringing
                        talent and employers together &mdash; and the limits of a
                        one-day event. STEP is the sustained follow-through: an
                        independent, non-profit institution turning education and
                        ambition into demonstrable skills and opportunity. It will
                        be introduced at the Career Excellence Youth Seminar on
                        24 October 2026.
                    </p>

                    <Link href="/about" className="btn-brand">
                        See More
                    </Link>
                </div>

                {/* Bordered image frame */}
                <div className="h-[470px] border border-[#eee] p-[10px] shadow-soft max-md:mt-[20px] dark:border-[#333]">
                    <img src={images.story} alt="Participants collaborating" />
                </div>
            </div>
        </section>
    );
}