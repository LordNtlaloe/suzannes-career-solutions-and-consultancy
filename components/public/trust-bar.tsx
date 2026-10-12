export function TrustBar() {
    const stats = [
        { value: "4", label: "Connected programmes" },
        { value: "75%", label: "Completion target" },
        { value: "80%", label: "Mentoring target" },
        { value: "10", label: "Districts served" },
    ]

    return (
        <section className="border-y border-line bg-light/82 dark:border-[#333] dark:bg-[#1a1a1a]">
            <div className="container-x py-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className="flex flex-col items-center text-center gap-1"
                        >
                            <span className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-blue-dark">
                                {s.value}
                            </span>
                            <span className="text-[11px] text-[#a1a1a1] uppercase tracking-[2.4px] dark:text-[#6b7280]">
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}