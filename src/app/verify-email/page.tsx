"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/src/components/layout/AuthLayout";
import { verifyEmail } from "@/src/lib/services/auth";

function VerificationStatus() {
  const token = useSearchParams().get("token") || "";
  const [message, setMessage] = useState(token ? "Verifying your email…" : "This verification link is invalid.");

  useEffect(() => {
    if (!token) return;
    let active = true;
    verifyEmail(token)
      .then((response) => active && setMessage(response.message || "Email verified successfully."))
      .catch(() => active && setMessage("This verification link is invalid or expired."));
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div role="status" className="alert alert-soft text-sm">{message}</div>
      <Link href="/login" className="btn bg-accent text-primary border-0">Continue to sign in</Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout title="Email verification" subtitle="Confirming your Trackmarkets account." centered>
      <Suspense fallback={<span className="loading loading-spinner" />}>
        <VerificationStatus />
      </Suspense>
    </AuthLayout>
  );
}
