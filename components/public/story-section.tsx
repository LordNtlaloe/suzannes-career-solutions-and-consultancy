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
                        Established with a simple idea: career decisions should be
                        clearer, more personal and more practical. General Project has
                        grown into a career agency supporting professionals through
                        transitions, applications, development and opportunity matching.
                    </p>

                    <Link href="/about" className="btn-brand">
                        See More
                    </Link>
                </div>

                {/* Bordered image frame */}
                <div className="h-[470px] border border-[#eee] p-[10px] shadow-soft max-md:mt-[20px] dark:border-[#333]">
                    <img src={images.story} alt="Professionals collaborating" />
                </div>
            </div>
        </section>
    );
}