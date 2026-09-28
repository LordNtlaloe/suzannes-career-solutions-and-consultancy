const LOGOS = [
    { label: "ADIRA", small: false },
    { label: "AMARA HR", small: true },
    { label: "HOLCIM", small: false },
    { label: "MNC", small: false },
    { label: "TELKOMSEL", small: true },
];

export function ClientStrip() {
    return (
        <section className="client-strip flex h-[120px] items-center bg-white max-md:h-[110px]">
            <div className="client-strip-text container-x flex items-center justify-between text-[18px] font-bold tracking-[-1px] text-[#999] opacity-70 grayscale max-md:flex-wrap max-md:justify-center max-md:gap-[20px]">
                {LOGOS.map((logo) => (
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