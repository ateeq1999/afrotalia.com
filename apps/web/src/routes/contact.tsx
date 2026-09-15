import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { cn } from "@afrotalia/ui/lib/utils";

import SectionRule from "@/components/web/SectionRule";
import { submitEnquiry } from "@/functions/contact";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const formSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
});

const inputClass = cn(
  "h-11 w-full rounded-lg border border-hairline bg-white px-3 text-[14px] outline-none transition-colors",
  "placeholder:text-caption focus:border-brand-green-700",
);

function ContactPage() {
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setStatus("idle");
    setErrorMessage(null);
    try {
      const result = await submitEnquiry({
        data: { ...parsed.data, phone: parsed.data.phone || undefined },
      });
      if (!result.ok) {
        setStatus("error");
        setErrorMessage(result.message);
        return;
      }
      setStatus("sent");
      setValues({ name: "", email: "", phone: "", message: "" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-white font-sans text-ink antialiased">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-16 sm:px-8 sm:pt-24">
        <p className="text-[13px] font-bold uppercase tracking-[0.8px] text-brand-green-700">Contact</p>
        <h1 className="mt-4 max-w-[760px] text-[38px] font-bold leading-[1.1] tracking-tight sm:text-[52px]">
          Let&apos;s talk.
        </h1>
      </section>

      <SectionRule />

      <section className="mx-auto w-full max-w-[640px] px-5 py-16 sm:px-8 sm:py-20">
        {status === "sent" ? (
          <div className="border-t-2 border-brand-green-700 pt-5">
            <h2 className="text-[18px] font-bold">Message sent.</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">
              Thanks for reaching out — we&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-muted-ink">
                Name
              </label>
              <input
                id="name"
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                className={inputClass}
                aria-invalid={Boolean(fieldErrors.name) || undefined}
              />
              {fieldErrors.name ? <p className="mt-1 text-[12px] text-danger">{fieldErrors.name}</p> : null}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-muted-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                className={inputClass}
                aria-invalid={Boolean(fieldErrors.email) || undefined}
              />
              {fieldErrors.email ? <p className="mt-1 text-[12px] text-danger">{fieldErrors.email}</p> : null}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-[13px] font-medium text-muted-ink">
                Phone (optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={values.phone}
                onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-[13px] font-medium text-muted-ink">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                value={values.message}
                onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                className={cn(inputClass, "h-auto resize-y py-2.5")}
                aria-invalid={Boolean(fieldErrors.message) || undefined}
              />
              {fieldErrors.message ? <p className="mt-1 text-[12px] text-danger">{fieldErrors.message}</p> : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "h-11 rounded-lg px-6 text-[14px] font-bold text-white transition-colors",
                submitting ? "cursor-not-allowed bg-surface-muted text-caption" : "bg-ink hover:bg-ink/85",
              )}
            >
              {submitting ? "Sending…" : "Send message"}
            </button>

            <div aria-live="polite" role="status" className="min-h-[20px]">
              {status === "error" && errorMessage ? (
                <p className="text-[13px] font-medium text-danger">{errorMessage}</p>
              ) : null}
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
