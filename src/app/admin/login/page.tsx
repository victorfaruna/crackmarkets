import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/src/components/admin/AdminLoginForm";
import DashboardBrand from "@/src/components/layout/DashboardBrand";
import { getCurrentAdmin } from "@/src/lib/auth/admin";

export const metadata: Metadata = { title: "Admin Sign In" };

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <main className="flex min-h-screen w-full min-w-0 bg-primary/30">
      <section className="hidden w-2/5 flex-col justify-between bg-shell-background p-10 text-on-dark lg:flex xl:p-14">
        <DashboardBrand size={42} />
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-widest text-shell-accent">
            Secure operations
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            Manage the platform from one focused workspace.
          </h1>
          <p className="mt-4 text-sm leading-6 text-on-dark/65">
            Review accounts, control access, handle KYC and broker states, and
            resolve pending withdrawal exceptions with a complete audit trail.
          </p>
        </div>
        <p className="text-xs text-on-dark/45">
          Administrative activity is recorded in the security audit log.
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="rounded-xl bg-shell-background px-4 py-3">
              <DashboardBrand size={32} />
            </div>
          </div>
          <AdminLoginForm />
          <p className="mt-4 text-center text-xs text-subtext lg:hidden">
            Administrative activity is recorded in the security audit log.
          </p>
        </div>
      </section>
    </main>
  );
}
