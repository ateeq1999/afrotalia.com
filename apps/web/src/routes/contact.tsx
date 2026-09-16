import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { cn } from "@afrotalia/ui/lib/utils";

import EmptyState from "@/components/web/EmptyState";
import SectionRule from "@/components/web/SectionRule";
import { getCmsBlocks } from "@/functions/cms";
import { submitEnquiry } from "@/functions/contact";

const CMS_SLUGS = ["contact.header", "contact.office", "contact.address", "contact.phone", "contact.email", "contact.hours", "contact.footnote"];

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  loader: () => getCmsBlocks({ data: { slugs: CMS_SLUGS } }),
});

const formSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(20, "Message must be at least 20 characters.").max(2000),
});

const inputClass = cn(
  "h-12 w-full rounded-lg border border-hairline bg-white px-3 text-[15px] outline-none transition-colors",
  "placeholder:text-caption focus:border-brand-green-700",
);

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-[12px] font-bold uppercase tracking-[0.6px] text-caption">{label}</dt>
      <dd className="mt-1.5 text-[14px]">{value ?? <EmptyState />}</dd>
    </div>
  );
}

function ContactPage() {
  const cms = Route.useLoaderData();
  const header = cms["contact.header"];

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
      const result = await submitEnquiry({ data: { ...parsed.data, phone: parsed.data.phone || undefined } });
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
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-12 sm:px-8 sm:pt-24">
        <p className="text-[12px] font-bold uppercase tracking-[0.8px] text-brand-green-700 sm:text-[13px]">
          {header?.eyebrow ?? "Contact"}
        </p>
        <h1 className="mt-3 max-w-[760px] text-[32px] font-bold leading-[1.1] tracking-tight sm:mt-4 sm:text-[52px]">
          {header?.title ?? <EmptyState />}
        </h1>
      </section>

      <SectionRule />

      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-10 px-5 py-12 sm:gap-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.4fr]">
        {/* Details */}
        <div>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-muted-ink">Details</h2>
          <dl className="mt-5 space-y-5">
            <Detail label="Head office" value={cms["contact.office"]?.body} />
            <Detail label="Street address" value={cms["contact.address"]?.body} />
            <Detail label="Phone / WhatsApp" value={cms["contact.phone"]?.body} />
            <Detail label="Email" value={cms["contact.email"]?.body} />
            <Detail label="Hours" value={cms["contact.hours"]?.body} />
          </dl>
        </div>

        {/* Enquiry form */}
        <div>
          {status === "sent" ? (
            <div className="border-t-2 border-brand-green-700 pt-5">
              <h2 className="text-[18px] font-bold">Sent — we&apos;ll be in touch</h2>
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
                  className={cn(inputClass, "h-auto resize-y py-3")}
                  aria-invalid={Boolean(fieldErrors.message) || undefined}
                />
                {fieldErrors.message ? <p className="mt-1 text-[12px] text-danger">{fieldErrors.message}</p> : null}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "h-12 w-full rounded-lg text-[14px] font-bold text-white transition-colors sm:w-auto sm:px-8",
                  submitting ? "cursor-not-allowed bg-surface-muted text-caption" : "bg-ink hover:bg-ink/85",
                )}
              >
                {submitting ? "Sending…" : "Send enquiry"}
              </button>

              <div aria-live="polite" role="status" className="min-h-[20px]">
                {status === "error" && errorMessage ? (
                  <p className="text-[13px] font-medium text-danger">{errorMessage}</p>
                ) : null}
              </div>

              {cms["contact.footnote"]?.body ? (
                <p className="text-[12px] text-caption">{cms["contact.footnote"].body}</p>
              ) : null}
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
