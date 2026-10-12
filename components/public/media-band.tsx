import { images } from "@/lib/data";

export function MediaBand() {
    return (
        <section className="relative h-72 overflow-hidden sm:h-96">
            <img
                src={images.hero}
                alt="Young people working together"
                className="h-full w-full object-cover"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/70 via-[#2a2a2a]/55 to-black/70" />
            <div className="container-x absolute inset-0 z-2 flex flex-col items-center justify-center">
                <p className="max-w-full text-center text-[clamp(22px,3vw,34px)] font-medium leading-snug text-white">
                    A continuous, cross-sector pathway linking learning,
                    mentorship, verified capabilities, supervised experience
                    and market access.
                </p>
            </div>
        </section>
    );
}
