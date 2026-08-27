import React, { Suspense } from "react";
import AuthLayout from "@/src/components/layout/AuthLayout";
import RegisterForm from "@/src/components/sections/RegisterForm";

const RegisterPage = () => {
  return (
    <AuthLayout
      title="Welcome."
      subtitle="Sign up to link your trading account, grow your 10-level referral organisation, and track multi-tier commissions."
    >
      <Suspense fallback={<div className="animate-pulse h-96 w-full bg-primary/20 rounded-xl" />}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
};

export default RegisterPage;
