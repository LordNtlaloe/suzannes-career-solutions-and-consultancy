const COHORTS = [
    { label: "BUSINESS & FINANCE", small: false },
    { label: "TECHNOLOGY & DATA", small: false },
    { label: "MEDIA & CREATIVE", small: true },
    { label: "ENGINEERING & INFRA", small: true },
    { label: "HEALTH & IMPACT", small: false },
    { label: "ENTREPRENEURSHIP", small: true },
];

export function ClientStrip() {
    return (
        <section className="client-strip flex h-[120px] items-center bg-white max-md:h-[110px]">
            <div className="client-strip-text container-x flex items-center justify-between text-[18px] font-bold tracking-[-1px] text-[#999] opacity-70 grayscale max-md:flex-wrap max-md:justify-center max-md:gap-[20px]">
                {COHORTS.map((logo) => (
                    <span
                        key={logo.label}
                        className={logo.small ? "text-[13px]" : ""}
                    >
                        {logo.label}
                    </span>
                ))}
            </div>
        </section>
    );
}