
export function Hero({
    eyebrow,
    title,
    text,
}: {
    eyebrow: string;
    title: string;
    text: string;
}) {
    return (
        <section className="inner-hero-bg relative min-h-[505px] overflow-hidden bg-hero-grad text-white max-md:min-h-[480px]">

            <div className="container-x relative z-2 pt-[76px] max-md:pt-[65px]">
                <p className="mb-[22px] text-[11px] font-semibold tracking-[2.4px] text-blue-light">
                    {eyebrow}
                </p>

                <h1 className="max-w-[800px] text-[clamp(46px,5vw,68px)] font-medium leading-[1.15] tracking-[-2px] max-md:text-[44px]">
                    {title}
                </h1>

                <p className="mt-[28px] max-w-[590px] text-[14px] leading-[1.8] text-[#c8c8c8]">
                    {text}
                </p>
            </div>
        </section>
    );
}