import React, { Suspense } from "react";
import AuthEntryLayout from "@/src/components/layout/AuthEntryLayout";
import RegisterForm from "@/src/components/sections/RegisterForm";

const RegisterPage = () => {
  return (
    <AuthEntryLayout mode="register">
      <Suspense fallback={<div className="animate-pulse h-96 w-full bg-primary/20 rounded-xl" />}>
        <RegisterForm />
      </Suspense>
    </AuthEntryLayout>
  );
};

export default RegisterPage;
