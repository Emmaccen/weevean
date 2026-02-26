import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { GitHubIcon, GoogleIcon } from "../shared/icons";
import { Button } from "../ui/button";

export function OAuthLoginButtons() {
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  // Doing this to prevent open redirects... You know, can't be too careful :)
  const callbackUrl =
    rawCallbackUrl &&
    rawCallbackUrl.startsWith("/") &&
    !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/";

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: new URL(callbackUrl, window.location.origin).toString(),
    });
  };

  const handleGitHubSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: new URL(callbackUrl, window.location.origin).toString(),
    });
  };
  return (
    <div className="space-y-3">
      <Button
        onClick={handleGitHubSignIn}
        variant="outline"
        className="w-full gap-3 h-11"
        type="button"
      >
        <GitHubIcon className="h-5 w-5" />
        <span>Continue with GitHub</span>
      </Button>
      <Button
        onClick={handleGoogleSignIn}
        variant="outline"
        className="w-full gap-3 h-11"
        type="button"
      >
        <GoogleIcon className="h-5 w-5" />
        <span>Continue with Google</span>
      </Button>
    </div>
  );
}
