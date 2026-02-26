"use client";
import { OAuthLoginButtons } from "@/components/auth/oauth-login-buttons";
import { WeeveanIcon } from "@/components/shared/icons";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block bg-muted">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="flex h-full flex-col items-center justify-center p-12">
          <div className="max-w-md space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <WeeveanIcon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Team collaboration, reimagined
            </h2>
            <p className="text-lg text-muted-foreground">
              Open-source team chat with AI-powered assistance. Built for
              developers, designed for everyone.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Multi-tenant workspaces</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>AI assistance</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Self-hosted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <WeeveanIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">Weevean</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to continue to your workspace
            </p>
          </div>

          <Suspense fallback={null}>
            <OAuthLoginButtons />
          </Suspense>
          <div className="text-center mt-5">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <span className="text-primary">
                one would be created for you automatically.
              </span>
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground/50 mt-8">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline hover:text-muted-foreground"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline hover:text-muted-foreground"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
