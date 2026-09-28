
import { services } from "@/lib/data";
import { ReadMore } from "./read-more";
import { SectionIntro } from "./section-intro";

export function ServicesSection() {
    return (
        <section id="services" className="bg-light/[.82] py-[80px] pb-[92px] dark:bg-[#1a1a1a]">
            <div className="container-x">
                <SectionIntro
                    heading={
                        <>
                            Our Excellent
                            <br />
                            Services
                        </>
                    }
                >
                    Explore focused career services designed to help you understand your
                    direction, communicate your value and access the next opportunity
                    with greater clarity.
                </SectionIntro>

                <div className="mt-[62px] grid grid-cols-1 gap-[24px] md:grid-cols-3">
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

                            <ReadMore href={`/services/${service.slug}`} />
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}