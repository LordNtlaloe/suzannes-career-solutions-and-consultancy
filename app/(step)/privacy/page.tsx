import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/privacy",
        title: "Privacy notice",
        description: "How STEP collects, uses and protects your data.",
        noIndex: true,
    });
}

export default function StepPrivacyPage() {
    return (
        <section className="container-x py-14 sm:py-20">
            <div className="mx-auto max-w-2xl">
                <header className="mb-8 flex flex-col gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Privacy
                    </span>
                    <h1 className="section-heading">How STEP uses your information.</h1>
                </header>

                <div className="section-copy flex flex-col gap-5 leading-relaxed">
                    <div>
                        <h2 className="mb-1.5 text-[15px] font-semibold text-brand">
                            What we collect
                        </h2>
                        <p>
                            We collect the details you give us in your application: your
                            name, email, chosen pathway, participant group, and short
                            answers about your goals and starting point. As you progress,
                            we record your learning submissions, assessment results,
                            mentoring notes and Skills Passport achievements.
                        </p>
                    </div>

                    <div>
                        <h2 className="mb-1.5 text-[15px] font-semibold text-brand">
                            Why we process it
                        </h2>
                        <p>
                            Your information is used only to run the STEP programme:
                            review and admit applications, place you in a cohort, track
                            your learning and readiness, verify achievements, and — with
                            your consent — introduce you to opportunity providers.
                        </p>
                    </div>

                    <div>
                        <h2 className="mb-1.5 text-[15px] font-semibold text-brand">
                            What we share
                        </h2>
                        <p>
                            Partners and opportunity providers only ever see aggregate,
                            non-identifying results, or a field-scoped Skills Passport
                            share that you (or a programme administrator) create. They
                            never get direct access to the talent pool.
                        </p>
                    </div>

                    <div>
                        <h2 className="mb-1.5 text-[15px] font-semibold text-brand">
                            Your choices
                        </h2>
                        <p>
                            You can withdraw your consent at any time by contacting the
                            programme team. Withdrawing consent may limit what we can
                            offer, but it never removes records we are required to keep
                            for programme administration.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
