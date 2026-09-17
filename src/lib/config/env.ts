export function requireServerEnv(name: "JWT_SECRET" | "DATABASE_URL"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be configured`);
  }
  if (name === "JWT_SECRET" && value.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
  return value;
}
