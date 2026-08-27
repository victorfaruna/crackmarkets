"use client";

import { useOnboardStore } from "@/src/lib/stores/onboardStore";
import { useState } from "react";
import InputWithIcon from "../../ui/InputWithIcon";

const TeamInvite = () => {
  const { next, back, formData, setFormData } = useOnboardStore();
  const emails = formData.emails;
  const [currentEmail, setCurrentEmail] = useState("");

  const addEmail = () => {
    const trimmed = currentEmail.trim();
    if (trimmed && !emails.includes(trimmed)) {
      setFormData({ emails: [...emails, trimmed] });
      setCurrentEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setFormData({ emails: emails.filter((e) => e !== email) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  return (
    <div className="flex flex-col gap-5 items-center w-full max-w-md animate-fade-in">
      <div className="flex flex-col items-center gap-1">
        <p className="font-medium font-clash-displayy text-xl text-secondary text-center leading-none">
          Invite Your Team
        </p>
        <p className="text-subtext font-medium text-center">
          Add team members to your workspace.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="flex gap-2">
          <InputWithIcon
            value={currentEmail}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
            }
            onChange={(e) => setCurrentEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="teammate@company.com"
          />

          <button
            onClick={addEmail}
            className="h-12 px-5 rounded-lg bg-secondary/10 text-secondary font-medium transition-colors"
          >
            Add
          </button>
        </div>

        {emails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {emails.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold"
              >
                {email}
                <button
                  onClick={() => removeEmail(email)}
                  className="hover:text-white transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center max-w-md">
        <button
          onClick={next}
          className="w-fit px-10 mx-auto flex  items-center justify-center gap-2 rounded-full bg-secondary font-semibold text-primary py-3 whitespace-nowrap transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
        >
          Continue
        </button>

        <button className="w-fit" onClick={next}>
          <p className="font-medium">Skip</p>
        </button>
      </div>
    </div>
  );
};

export default TeamInvite;
