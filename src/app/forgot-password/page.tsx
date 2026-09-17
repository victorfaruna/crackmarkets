"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/src/components/layout/AuthLayout";
import TurnstileWidget from "@/src/components/shared/TurnstileWidget";
import { forgotPassword } from "@/src/lib/services/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsPending(true);
    setMessage("");
    try {
      const response = await forgotPassword(email.trim(), turnstileToken || undefined);
      setMessage(response.message || "If the account exists, reset instructions have been sent.");
    } catch {
      setMessage("Unable to submit the request. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We will send a secure reset link to your email." centered>
      <form className="flex flex-col gap-4 w-full" onSubmit={submit}>
        <label className="form-control gap-1.5">
          <span className="text-sm text-secondary/70">Email address</span>
          <input
            className="input w-full bg-primary/20 border-secondary/15 text-secondary"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <TurnstileWidget onToken={setTurnstileToken} />
        {message && <div role="status" className="alert alert-soft text-sm">{message}</div>}
        <button className="btn bg-accent text-primary border-0" disabled={isPending} type="submit">
          {isPending ? <span className="loading loading-spinner loading-sm" /> : "Send reset link"}
        </button>
        <Link href="/login" className="link text-center text-sm text-accent">Back to sign in</Link>
      </form>
    </AuthLayout>
  );
}
