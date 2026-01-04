"use client";

import api from "@/lib/api/axios";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (!name || !email || !message) {
      toast.error("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post("/contact", {
        name,
        email,
        subject,
        message,
      });

      toast.success("Message sent successfully!");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <main className="max-w-4xl mx-auto p-6 min-h-screen">
      <section className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Get in Touch</h1>
        <p className="text-base text-gray-600">
          We’d love to hear from you! Whether you have a question about our
          tours, feedback, or just want to say hi, feel free to reach out.
        </p>
      </section>

      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold">Email</h2>
        <p className="text-sm text-gray-500">helpsprtcontact@gmail.com</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-xl mx-auto"
      >
        <input
          type="text"
          placeholder="Name"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subject"
          className="input input-bordered w-full"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>

        <button
          className="btn btn-primary self-center mt-2"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>

        {errorMessage && (
          <div className="text-error text-sm text-center">{errorMessage}</div>
        )}
      </form>
    </main>
  );
}
