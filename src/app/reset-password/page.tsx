"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/src/components/layout/AuthLayout";
import { resetPassword } from "@/src/lib/services/auth";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return setMessage("This reset link is invalid.");
    if (password.length < 12) return setMessage("Password must be at least 12 characters.");
    setIsPending(true);
    try {
      const response = await resetPassword(token, password);
      setMessage(response.message || "Password updated successfully.");
      setPassword("");
    } catch {
      setMessage("The reset link is invalid or expired.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={submit}>
      <label className="form-control gap-1.5">
        <span className="text-sm text-secondary/70">New password</span>
        <input
          className="input w-full bg-primary/20 border-secondary/15 text-secondary"
          type="password"
          minLength={12}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
      </label>
      {message && <div role="status" className="alert alert-soft text-sm">{message}</div>}
      <button className="btn bg-accent text-primary border-0" disabled={isPending || !token} type="submit">
        {isPending ? <span className="loading loading-spinner loading-sm" /> : "Update password"}
      </button>
      <Link href="/login" className="link text-center text-sm text-accent">Back to sign in</Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Choose a new password" subtitle="Use at least 12 characters." centered>
      <Suspense fallback={<span className="loading loading-spinner" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
