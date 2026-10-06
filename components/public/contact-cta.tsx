"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Send } from "lucide-react"
// No UI library imports — using brand-styled elements

export function ContactCta() {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.currentTarget
        const fd = new FormData(form)

        setLoading(true)
        try {
            // TODO: wire to your endpoint
            // await fetch("/api/contact", { method: "POST", body: fd })
            await new Promise((r) => setTimeout(r, 800))

            toast.success("Message sent — we'll be in touch soon")
            form.reset()
            setSent(true)
        } catch (err: any) {
            toast.error(err?.message ?? "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section
            id="contact"
            className="scroll-mt-16 mx-auto w-full max-w-6xl px-4 py-16 sm:py-24"
        >
            <div className="rounded-2xl border border-line bg-linear-to-br from-blue/10 via-card to-muted p-8 sm:p-12 shadow-soft">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    {/* Copy */}
                    <div className="flex flex-col gap-4">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Get in touch
                        </span>
                        <h2 className="section-heading leading-tight">
                            Start with a free 20-minute call.
                        </h2>
                        <p className="section-copy leading-relaxed">
                            Whether you&apos;re hiring or looking, the first
                            conversation is free. No pitch deck, no sales
                            script, no obligation.
                        </p>

                        <ul className="flex flex-col gap-3 pt-2">
                            <Bullet>Response within one business day</Bullet>
                            <Bullet>No commitment after the call</Bullet>
                            <Bullet>We&apos;ll say so if we&apos;re not a fit</Bullet>
                        </ul>
                    </div>

                    {/* Form */}
                    <div className="rounded-xl border border-line bg-card p-6 shadow-soft dark:bg-[#242527] dark:border-[#333]">
                        {sent ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-center">
                                <h3 className="font-semibold">
                                    Thanks for reaching out
                                </h3>
                                <p className="text-sm text-brand-muted">
                                    We&apos;ll reply within one business day.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-4"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                        name="name"
                                        placeholder="Name"
                                        required
                                        disabled={loading}
                                        aria-label="Name"
                                        className="w-full h-10 rounded-md border border-line bg-card px-3 text-[13px] text-ink placeholder:text-[#a1a1a1] outline-none focus:border-blue-dark focus:ring-1 focus:ring-blue-dark transition-colors dark:bg-[#242527] dark:text-[#f6f6f6] dark:placeholder:text-[#6b7280] dark:border-[#333]"
                                    />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        required
                                        disabled={loading}
                                        aria-label="Email"
                                        autoComplete="email"
                                        className="w-full h-10 rounded-md border border-line bg-card px-3 text-[13px] text-ink placeholder:text-[#a1a1a1] outline-none focus:border-blue-dark focus:ring-1 focus:ring-blue-dark transition-colors dark:bg-[#242527] dark:text-[#f6f6f6] dark:placeholder:text-[#6b7280] dark:border-[#333]"
                                    />
                                </div>

                                <select
                                    name="interest"
                                    aria-label="What this is about"
                                    className="w-full h-10 rounded-md border border-line bg-card px-3 text-[13px] text-ink outline-none focus:border-blue-dark focus:ring-1 focus:ring-blue-dark transition-colors dark:bg-[#242527] dark:text-[#f6f6f6] dark:border-[#333]"
                                    disabled={loading}
                                >
                                    <option value="candidate">
                                        I&apos;m looking for a role
                                    </option>
                                    <option value="company">
                                        I&apos;m hiring
                                    </option>
                                    <option value="coaching">
                                        Career coaching
                                    </option>
                                    <option value="other">
                                        Something else
                                    </option>
                                </select>

                                <textarea
                                    name="message"
                                    rows={4}
                                    required
                                    disabled={loading}
                                    placeholder="Tell us a bit about what you're working on..."
                                    aria-label="Message"
                                    className="w-full rounded-md border border-line bg-card px-3 py-2 text-[13px] text-ink placeholder:text-[#a1a1a1] outline-none focus:border-blue-dark focus:ring-1 focus:ring-blue-dark transition-colors resize-none dark:bg-[#242527] dark:text-[#f6f6f6] dark:placeholder:text-[#6b7280] dark:border-[#333]"
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-brand w-full min-h-11! disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2
                                            className="h-4 w-4 animate-spin"
                                            aria-hidden
                                        />
                                    ) : (
                                        <Send
                                            className="h-4 w-4 mr-1.5"
                                            aria-hidden
                                        />
                                    )}
                                    {loading ? "Sending..." : "Send message"}
                                </button>

                                <p className="text-[11px] text-[#a1a1a1] text-center">
                                    We read every message personally.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

function Bullet({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-3">
            <span className="mt-2 shrink-0 inline-block h-1.5 w-1.5 rounded-full bg-blue" />
            <span className="text-[13px] text-[#a1a1a1] leading-relaxed">
                {children}
            </span>
        </li>
    )
}