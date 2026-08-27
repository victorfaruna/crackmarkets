"use client";

import React from "react";
import AuthLayout from "@/src/components/layout/AuthLayout";
import LoginForm from "@/src/components/sections/LoginForm";

const LoginPage = () => {
  return (
    <AuthLayout
      title="Welcome Back."
      subtitle="Sign in to access your trading account, manage your 10-level referral organisation, and track commissions."
      centered
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
