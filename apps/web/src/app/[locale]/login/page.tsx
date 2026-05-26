"use client";

import { useState } from "react";
import { ForgotPasswordForm } from "./_components/forgot-password-form";
import { LoginForm } from "./_components/login-form";
import { Header } from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer";

type View = "login" | "forgot";

export default function LoginPage() {
  const [view, setView] = useState<View>("login");

  let content;
  if (view === "forgot") {
    content = <ForgotPasswordForm onBack={() => setView("login")} />;
  } else {
    content = <LoginForm onForgotClick={() => setView("forgot")} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-y-auto scrollbar bg-canvas">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">{content}</main>
      <Footer />
    </div>
  );
}
