"use client";
import { WeeveanIcon } from "@/components/shared/icons";
import Link from "next/link";

import { OAuthLoginButtons } from "@/components/auth/oauth-login-buttons";
import { Suspense } from "react";
const FEATURES = [
  {
    title: "Self-hosted & open source",
    description: "Your data stays on your infrastructure",
  },
  {
    title: "AI-powered assistance",
    description: "Get help from Claude right in your workspace",
  },
  {
    title: "Developer-friendly",
    description: "Built with Next.js, TypeScript, and modern tools",
  },
];

export default function SignupPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <WeeveanIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">Weevean</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Get started with your team workspace
            </p>
          </div>

          <Suspense fallback={null}>
            <OAuthLoginButtons />
          </Suspense>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary/90"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden lg:block bg-muted">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="flex h-full flex-col items-center justify-center p-12">
          <div className="max-w-md space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <WeeveanIcon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Join thousands of teams
            </h2>
            <p className="text-lg text-muted-foreground">
              Ship faster with real-time collaboration, AI assistance, and full
              data control.
            </p>
            <div className="space-y-4 pt-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 text-left"
                >
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <svg
                      className="h-3 w-3 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
