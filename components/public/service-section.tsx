
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
                            What STEP
                            <br />
                            Delivers
                        </>
                    }
                >
                    STEP links learning to application, application to assessment,
                    and verified preparedness to opportunity &mdash; so participants
                    finish work-ready with a Skills Passport.
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

                            <ReadMore href="/" />
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}