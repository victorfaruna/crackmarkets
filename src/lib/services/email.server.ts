interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(message: EmailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, ...message }),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

function applicationUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function sendVerificationEmail(email: string, token: string) {
  const url = `${applicationUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: email,
    subject: "Verify your Trackmarkets email",
    html: `<p>Verify your Trackmarkets email address:</p><p><a href="${url}">Verify email</a></p><p>This link expires in 24 hours.</p>`,
  });
}

export function sendPasswordResetEmail(email: string, token: string) {
  const url = `${applicationUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: email,
    subject: "Reset your Trackmarkets password",
    html: `<p>A password reset was requested for your Trackmarkets account.</p><p><a href="${url}">Reset password</a></p><p>This link expires in one hour. Ignore this email if you did not request it.</p>`,
  });
}
