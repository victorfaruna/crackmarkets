"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginWithCredentials } from "@/src/lib/services/auth";
import { useUserStore } from "@/src/lib/stores/userStore";
import { useAppStore } from "@/src/lib/stores/appStore";
import AuthIcon from "@/src/components/shared/AuthIcon";
import TurnstileWidget from "@/src/components/shared/TurnstileWidget";

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  // State feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginWithCredentials({
        email: email.trim().toLowerCase(),
        password,
        turnstile_token: turnstileToken || undefined,
      });

      if (res.success && res.data) {
        const isConnectedToRoboForex = res.data.user.roboforex_linked === true;
        useAppStore
          .getState()
          .setIsConnectedToRoboForex(isConnectedToRoboForex);
        const targetRoute = isConnectedToRoboForex
          ? "/dashboard"
          : "/dashboard/profile";

        setSuccess("Login successful! Redirecting...");

        // Sync user state with store
        setUser({
          id: res.data.user.id,
          email: res.data.user.email,
          firstName: res.data.user.first_name,
          lastName: res.data.user.last_name,
        });

        setTimeout(() => {
          router.push(targetRoute);
        }, 1000);
      } else {
        setError(
          res.message || "Failed to log in. Please check your credentials.",
        );
      }
    } catch (err: unknown) {
      const anyErr = err as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
        message?: string;
      };
      const serverMsg =
        anyErr.response?.data?.message ||
        anyErr.message ||
        "An unexpected error occurred during login.";
      setError(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      {/* Alert Error / Success */}
      {error && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {success}
        </div>
      )}

      {/* Email Address */}
      <div className="relative flex flex-col gap-1.5">
        <label htmlFor="log-email" className="sr-only">Email Address</label>
        <AuthIcon name="email" className="pointer-events-none absolute bottom-2.5 left-3 z-1 size-5 text-secondary/50" />
        <input
          id="log-email"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="input w-full h-10 pl-11 pr-4 rounded-md border border-secondary/10 bg-primary/20 text-secondary placeholder:text-secondary/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-all text-sm font-medium"
        />
      </div>

      {/* Password with eye toggle */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="sr-only">Password</label>
        <div className="relative w-full">
          <AuthIcon name="lock" className="pointer-events-none absolute left-3 top-2.5 z-1 size-5 text-secondary/50" />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="input w-full h-10 pl-11 pr-11 rounded-md border border-secondary/10 bg-primary/20 text-secondary placeholder:text-secondary/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-all text-sm font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute z-1 right-3.5 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary transition-colors p-1 cursor-pointer"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="checkbox checkbox-xs rounded border-secondary/20 bg-primary/30 checked:bg-accent checked:border-accent"
          />
          <span className="text-sm text-secondary/70 font-medium">
            Remember this device
          </span>
        </label>
          <Link
            href="/forgot-password"
            className="text-sm text-accent hover:underline font-medium"
          >
            Forgot password?
          </Link>
      </div>

      <TurnstileWidget onToken={setTurnstileToken} />

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn w-full h-11 min-h-11 mt-1 rounded-lg border-0 bg-auth-action hover:bg-auth-action/90 active:scale-[0.99] text-on-dark font-medium text-base transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          "Sign In"
        )}
      </button>

      {/* Switch to Register link */}
      <p className="text-center text-sm text-secondary/60 mt-1">
        Don&apos;t have an account?{" "}
        {onSwitchToRegister ? (
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-accent font-semibold hover:underline cursor-pointer"
          >
            Register Now
          </button>
        ) : (
          <Link
            href="/register"
            className="text-accent font-semibold hover:underline cursor-pointer"
          >
            Register Now
          </Link>
        )}
      </p>
    </form>
  );
};

export default LoginForm;
