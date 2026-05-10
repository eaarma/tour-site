"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  eyebrow: string;
  title: string;
  description: string | null;
  contactEmail: string | null;
  supportPhone: string | null;
  addressLines: string[];
  businessHours: string | null;
  detailsTitle: string;
  detailsDescription: string;
  bestForTitle: string;
  bestForDescription: string;
  emptyDetailsMessage: string;
  closingNote: string | null;
  messageTitle: string;
  messageDescription: string;
  submitButtonLabel: string;
};

export default function ContactPageContent({
  eyebrow,
  title,
  description,
  contactEmail,
  supportPhone,
  addressLines,
  businessHours,
  detailsTitle,
  detailsDescription,
  bestForTitle,
  bestForDescription,
  emptyDetailsMessage,
  closingNote,
  messageTitle,
  messageDescription,
  submitButtonLabel,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (!name || !email || !message) {
      toast.error("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(data?.error || "Failed to send message");
      }

      toast.success("Message sent successfully!");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error: unknown) {
      const messageText =
        error instanceof Error ? error.message : "Failed to send message";
      setErrorMessage(messageText);
      toast.error(messageText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-4 min-h-screen max-w-6xl p-6 sm:mt-6">
      <section className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 text-base leading-7 text-base-content/70">
            {description}
          </p>
        ) : null}
      </section>

      <div className="overflow-hidden rounded-[28px] border border-base-300 bg-base-100 shadow-sm">
        <div className="grid divide-y divide-base-300 md:grid-cols-[0.88fr_1.12fr] md:divide-x md:divide-y-0">
          <section className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-base-content">
              {detailsTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-base-content/60">
              {detailsDescription}
            </p>

            <div className="mt-6 grid gap-4">
              {contactEmail || supportPhone || addressLines.length > 0 || businessHours ? (
                <>
                  {contactEmail ? (
                    <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Website email
                      </p>
                      <a
                        className="mt-2 inline-block text-base font-medium text-base-content hover:text-primary"
                        href={`mailto:${contactEmail}`}
                      >
                        {contactEmail}
                      </a>
                    </div>
                  ) : null}

                  {supportPhone ? (
                    <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Phone
                      </p>
                      <a
                        className="mt-2 inline-block text-base font-medium text-base-content hover:text-primary"
                        href={`tel:${supportPhone}`}
                      >
                        {supportPhone}
                      </a>
                    </div>
                  ) : null}

                  {addressLines.length > 0 ? (
                    <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Address
                      </p>
                      <div className="mt-2 space-y-1 text-sm leading-6 text-base-content/75">
                        {addressLines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {businessHours ? (
                    <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Support hours
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-base-content/75">
                        {businessHours}
                      </p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/25 p-4 text-sm text-base-content/60">
                  {emptyDetailsMessage}
                </div>
              )}

              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {bestForTitle}
                </p>
                <p className="mt-2 text-sm leading-6 text-base-content/75">
                  {bestForDescription}
                </p>
              </div>
            </div>

            {closingNote ? (
              <div className="mt-6 rounded-2xl border border-base-300 bg-base-200/35 p-4 text-sm text-base-content/65">
                {closingNote}
              </div>
            ) : null}
          </section>

          <section className="bg-base-100/65 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-base-content">
                {messageTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-base-content/60">
                {messageDescription}
              </p>
              <p className="mt-2 text-sm leading-6 text-base-content/55">
                {contactEmail
                  ? `You can also reach us directly at ${contactEmail}.`
                  : "Your message will be delivered through the site contact inbox."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Name"
                className="input input-bordered w-full rounded-xl"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered w-full rounded-xl"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Subject"
                className="input input-bordered w-full rounded-xl"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
              <textarea
                className="textarea textarea-bordered w-full rounded-xl"
                placeholder="Message"
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              />

              <button
                className="btn btn-primary self-start rounded-xl px-6"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : submitButtonLabel}
              </button>

              {errorMessage ? (
                <div className="text-sm text-error">{errorMessage}</div>
              ) : null}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
