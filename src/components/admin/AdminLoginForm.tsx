"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TurnstileWidget from "@/src/components/shared/TurnstileWidget";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
        }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !payload.success) {
        setError(payload.message || "Unable to sign in.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card border border-secondary/10 bg-background shadow-xl shadow-secondary/5" onSubmit={handleSubmit}>
      <div className="card-body gap-5 p-6 sm:p-8">
        <div>
          <span className="badge badge-sm border-accent/25 bg-accent/10 text-accent">
            Restricted access
          </span>
          <h1 className="card-title mt-4 text-2xl text-secondary">
            Admin sign in
          </h1>
          <p className="mt-1 text-sm text-subtext">
            Use an active account with the ADMIN role.
          </p>
        </div>

        {error ? (
          <div role="alert" className="alert alert-error alert-soft text-sm">
            <span>{error}</span>
          </div>
        ) : null}

        <label className="flex flex-col gap-2 text-sm font-medium text-secondary/80">
          Email address
          <input
            className="input w-full border-secondary/15 bg-primary/30 text-secondary placeholder:text-subtext focus:border-accent focus:outline-accent/20"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            autoComplete="username"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-secondary/80">
          Password
          <input
            className="input w-full border-secondary/15 bg-primary/30 text-secondary placeholder:text-subtext focus:border-accent focus:outline-accent/20"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </label>

        <TurnstileWidget onToken={setTurnstileToken} />

        <div className="card-actions">
          <button
            type="submit"
            className="btn btn-block border-accent bg-accent text-background hover:bg-accent/90"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : null}
            {loading ? "Signing in" : "Sign in to admin"}
          </button>
        </div>
      </div>
    </form>
  );
}
