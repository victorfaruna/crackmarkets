"use client";

import React from "react";
import AuthEntryLayout from "@/src/components/layout/AuthEntryLayout";
import LoginForm from "@/src/components/sections/LoginForm";

const LoginPage = () => {
  return (
    <AuthEntryLayout mode="login">
      <LoginForm />
    </AuthEntryLayout>
  );
};

export default LoginPage;
