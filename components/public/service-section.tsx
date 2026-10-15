
import { services } from "@/lib/data";
import { ReadMore } from "./read-more";
import { SectionIntro } from "./section-intro";

export function ServicesSection() {
    return (
        <section id="services" className="bg-light/[.82] py-[80px] pb-[92px] dark:bg-[#202020]">
            <div className="container-x">
                <SectionIntro
                    heading={
                        <>
                            Four connected
                            <br />
                            programmes
                        </>
                    }
                >
                    STEP links learning, mentorship, supervised experience and
                    markets into one continuous pathway — from school to
                    sustainable livelihoods.
                </SectionIntro>

                <div className="mt-[62px] grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-4">
                    {services.map((service) => (
                        <article key={service.slug}>
                            <div className="h-[287px] border border-[#eee] bg-white p-[7px] dark:border-[#333] dark:bg-[#242527]">
                                <img src={service.image} alt="" />
                            </div>

                            <h3 className="mt-[22px] text-[18px] font-semibold">
                                {service.title}
                            </h3>

                            <p className="section-copy mt-[12px] max-w-[340px] dark:text-[#9ca3af]">
                                {service.text}
                            </p>

                            <ReadMore href="/apply" />
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}