import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { cn } from "@afrotalia/ui/lib/utils";

import BackToAuctions from "@/components/mnada/BackToAuctions";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

type Mode = "sign-up" | "sign-in";

function RouteComponent() {
  const [mode, setMode] = useState<Mode>("sign-up");

  return (
    <main className="bg-[#08090A] font-sans text-[#F5F5F5] antialiased">
      <div className="mx-auto w-full max-w-[400px] px-4 pb-14 pt-5">
        <BackToAuctions />

        <div className="mt-8 text-center">
          <img
            src="/logos/afrotalia-mnada-dark.svg"
            alt="Afrotalia Mnada"
            className="mx-auto h-9 w-auto"
          />
          <h1 className="mt-5 text-[24px] font-bold tracking-tight">
            {mode === "sign-up" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-[13px] text-[#8F9095]">
            {mode === "sign-up"
              ? "Register to bid in live auctions."
              : "Sign in to continue bidding."}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Authentication method"
          className="mt-6 grid grid-cols-2 gap-1 rounded-lg border border-white/[0.08] bg-[#19191C] p-1"
        >
          {(
            [
              { key: "sign-up", label: "Sign up" },
              { key: "sign-in", label: "Sign in" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={mode === tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              className={cn(
                "h-10 rounded-md text-[14px] font-semibold transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]",
                mode === tab.key
                  ? "bg-[#2A2A2E] text-[#F5F5F5]"
                  : "text-[#8F9095] hover:text-[#F5F5F5]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#111113] p-6">
          {mode === "sign-up" ? <SignUpForm /> : <SignInForm />}
        </div>

        <p className="mt-4 text-center text-[12px] leading-relaxed text-[#8F9095]">
          New accounts start as pending until the one-time registration fee is
          paid. Only active accounts can bid.
        </p>
      </div>
    </main>
  );
}
