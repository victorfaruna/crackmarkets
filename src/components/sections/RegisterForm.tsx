"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { COUNTRIES, Country } from "@/src/lib/constants/countries";
import { register } from "@/src/lib/services/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { trackReferralImpression } from "@/src/lib/services/impressions";
import AuthIcon from "@/src/components/shared/AuthIcon";
import TurnstileWidget from "@/src/components/shared/TurnstileWidget";

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Selected Country & Dial code (chosen via phone prefix)
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES[0], // Defaults to Albania
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const initialReferralCode =
    searchParams.get("ref") || searchParams.get("e") || "";
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const impressionTracked = useRef(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  // Auto-detect referral code from query parameters and log impression
  useEffect(() => {
    if (initialReferralCode && !impressionTracked.current) {
      impressionTracked.current = true;
      trackReferralImpression(initialReferralCode, selectedCountry.name);
    }
  }, [initialReferralCode, selectedCountry.name]);

  // Checkboxes
  const [riskAck, setRiskAck] = useState(false);
  const [leverageAck, setLeverageAck] = useState(false);

  // Dropdown state for Phone code selector
  const [isPhoneCodeOpen, setIsPhoneCodeOpen] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");

  // State feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const phoneRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (phoneRef.current && !phoneRef.current.contains(e.target as Node)) {
        setIsPhoneCodeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPhoneCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      c.dialCode.includes(phoneSearch),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!password || password.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }
    if (!riskAck || !leverageAck) {
      setError("Please acknowledge the trading & risk disclaimers to proceed.");
      return;
    }

    setIsLoading(true);

    try {
      const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber.replace(/^0+/, "")}`;
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: fullPhoneNumber,
        country: selectedCountry.name,
        password,
        referral_code: referralCode.trim() ? referralCode.trim() : undefined,
        turnstile_token: turnstileToken || undefined,
      };

      const res = await register(payload);

      if (res.success) {
        setSuccess(
          res.message || "Registration successful! Redirecting to login...",
        );
        setTimeout(() => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          } else {
            router.push("/login");
          }
        }, 1500);
      } else {
        setError(res.message || "Failed to complete registration.");
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
        "An unexpected error occurred.";
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
        <label htmlFor="reg-email" className="sr-only">Email Address</label>
        <AuthIcon name="email" className="pointer-events-none absolute bottom-2.5 left-3 z-1 size-5 text-secondary/50" />
        <input
          id="reg-email"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="input w-full h-10 pl-11 pr-4 rounded-md border border-secondary/10 bg-primary/20 text-secondary placeholder:text-secondary/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-all text-sm font-medium"
        />
      </div>

      {/* First & Last Name */}
      <div className="grid grid-cols-1 gap-3">
        <div className="relative flex flex-col gap-1.5">
          <label htmlFor="reg-firstName" className="sr-only">First Name</label>
          <AuthIcon name="person" className="pointer-events-none absolute bottom-2.5 left-3 z-1 size-5 text-secondary/50" />
          <input
            id="reg-firstName"
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
            className="input w-full h-10 pl-11 pr-4 rounded-md border border-secondary/10 bg-primary/20 text-secondary placeholder:text-secondary/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-all text-sm font-medium"
          />
        </div>
        <div className="relative flex flex-col gap-1.5">
          <label htmlFor="reg-lastName" className="sr-only">Last Name</label>
          <AuthIcon name="person" className="pointer-events-none absolute bottom-2.5 left-3 z-1 size-5 text-secondary/50" />
          <input
            id="reg-lastName"
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
            className="input w-full h-10 pl-11 pr-4 rounded-md border border-secondary/10 bg-primary/20 text-secondary placeholder:text-secondary/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Phone Number Field with Code Selector */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="register-phone" className="sr-only">Phone Number</label>
        <div
          className="relative w-full flex items-center rounded-md border border-secondary/10 bg-primary/20 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/10 transition-all h-10"
          ref={phoneRef}
        >
          <button
            type="button"
            onClick={() => setIsPhoneCodeOpen(!isPhoneCodeOpen)}
            aria-label={`Country: ${selectedCountry.name}, ${selectedCountry.dialCode}`}
            aria-expanded={isPhoneCodeOpen}
            className="h-full pl-3.5 pr-2.5 flex items-center gap-1.5 border-r border-secondary/15 text-sm font-medium text-secondary hover:bg-secondary/5 rounded-l-md transition-colors shrink-0 cursor-pointer"
          >
            <span className="text-lg leading-none">{selectedCountry.flag}</span>
            <span className="text-secondary/90 font-medium">
              {selectedCountry.dialCode}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`size-3 text-secondary/60 transition-transform ${
                isPhoneCodeOpen ? "rotate-180" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          <input
            id="register-phone"
            type="tel"
            placeholder="Mobile phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            autoComplete="tel"
            className="min-w-0 flex-1 h-full px-3.5 bg-transparent text-secondary placeholder:text-secondary/40 outline-none text-sm font-medium"
          />

          {isPhoneCodeOpen && (
            <div className="absolute z-50 left-0 top-13 w-72 bg-background border border-secondary/20 rounded-xl shadow-xl p-2 max-h-60 flex flex-col gap-1 overflow-hidden">
              <input
                type="text"
                placeholder="Search country or code..."
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-secondary/15 bg-primary/30 outline-none text-secondary placeholder:text-secondary/40"
                autoFocus
              />
              <div className="overflow-y-auto flex-1 flex flex-col">
                {filteredPhoneCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(c);
                      setIsPhoneCodeOpen(false);
                      setPhoneSearch("");
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between rounded-lg text-left text-sm font-medium hover:bg-primary/50 transition-colors cursor-pointer ${
                      selectedCountry.code === c.code
                        ? "bg-primary text-accent font-semibold"
                        : "text-secondary"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span className="truncate max-w-[140px]">{c.name}</span>
                    </span>
                    <span className="text-secondary/60 font-mono text-[11px]">
                      {c.dialCode}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password with eye toggle */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="register-password" className="sr-only">Password</label>
        <div className="relative w-full">
          <AuthIcon name="lock" className="pointer-events-none absolute left-3 top-2.5 z-1 size-5 text-secondary/50" />
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Password (at least 12 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
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

      {/* Referral Code (Optional) */}
      <div className="relative flex flex-col gap-1.5">
        <label htmlFor="register-referral" className="sr-only">
          Referral Code{" "}
          <span className="text-secondary/40 font-normal">(Optional)</span>
        </label>
        <AuthIcon name="network" className="pointer-events-none absolute bottom-2.5 left-3 z-1 size-5 text-secondary/50" />
        <input
          id="register-referral"
          type="text"
          placeholder="Referral code (optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="input w-full h-10 pl-11 pr-4 rounded-md border border-secondary/10 bg-primary/20 text-secondary placeholder:text-secondary/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-all text-sm font-medium"
        />
      </div>

      {/* Disclaimer Checkboxes */}
      <div className="flex flex-col gap-2.5 pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer text-sm text-secondary/80 select-none leading-snug">
          <input
            type="checkbox"
            checked={riskAck}
            onChange={(e) => setRiskAck(e.target.checked)}
            required
            className="mt-0.5 size-4 rounded border-secondary/30 accent-accent cursor-pointer shrink-0"
          />
          <span>
            I acknowledge CFD trading is highly risky and may not be suitable
            for all investors.
          </span>
        </label>

        <label className="flex items-start gap-2.5 cursor-pointer text-sm text-secondary/80 select-none leading-snug">
          <input
            type="checkbox"
            checked={leverageAck}
            onChange={(e) => setLeverageAck(e.target.checked)}
            required
            className="mt-0.5 size-4 rounded border-secondary/30 accent-accent cursor-pointer shrink-0"
          />
          <span>
            I understand Leverage can amplify losses beyond the initial
            investment & before trading CFDs or Forex, I should assess my
            investment goals, experience, and risk tolerance.
          </span>
        </label>
      </div>

      <TurnstileWidget onToken={setTurnstileToken} />

      {/* Register Now Action Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn w-full h-11 min-h-11 mt-1 rounded-lg border-0 bg-auth-action hover:bg-auth-action/90 active:scale-[0.99] text-on-dark font-medium text-base transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          "Create Account"
        )}
      </button>

      {/* Sign in switch */}
      <p className="text-center text-sm text-secondary/60 mt-1">
        Already have an account?{" "}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-accent font-semibold hover:underline cursor-pointer"
          >
            Sign in
          </button>
        ) : (
          <Link
            href="/login"
            className="text-accent font-semibold hover:underline cursor-pointer"
          >
            Sign in
          </Link>
        )}
      </p>
    </form>
  );
};

export default RegisterForm;
