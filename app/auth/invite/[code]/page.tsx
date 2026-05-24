"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { ClientError } from "@/lib/client-error";
import { fetcher } from "@/lib/utils";
import { Loader2, RocketIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface InviteData {
  workspaceName: string;
  workspaceIcon: string | null;
  alreadyMember: boolean;
  workspaceId: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const code = params.code as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      if (isPending) return;
      if (!session) {
        router.push(`/auth/sign-in?callbackUrl=/auth/invite/${code}`);
        return;
      }

      try {
        const data = await fetcher<InviteData>(`/api/invites/${code}`);
        setInvite(data);

        if (data.alreadyMember) {
          toast.info(`You are already a member of ${data.workspaceName}`);
          router.replace(`/?workspace=${data.workspaceId}`);
        }
      } catch (err) {
        const clientError = new ClientError(err);
        setError(
          clientError.message || "Failed to load invite. It may have expired.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadInvite();
  }, [code, session, isPending, router]);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const resp = await fetcher<{ workspaceId: string }>(
        `/api/invites/${code}`,
        {
          method: "POST",
        },
        "Failed to accept invite.",
      );

      toast.success("Successfully joined workspace!");
      router.push(`/?workspace=${resp.workspaceId}`);
    } catch (err) {
      const clientError = new ClientError(err);
      setError(
        clientError.message || "An error occurred joining the workspace.",
      );
    } finally {
      setIsAccepting(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <RocketIcon className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Invalid Invite</h2>
          <p className="mb-6 text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => router.push("/")} className="w-full">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-card shadow-xl">
        <div className="flex flex-col items-center p-8 text-center sm:p-10">
          <div className="mb-6 flex space-x-4">
            {/* Workspace Avatar */}
            {invite.workspaceIcon ? (
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage src={invite.workspaceIcon} />
                <AvatarFallback className="text-2xl">
                  {invite.workspaceName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-sidebar-primary text-sidebar-primary-foreground shadow-md">
                <RocketIcon className="h-10 w-10" />
              </div>
            )}
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight">
            Join {invite.workspaceName}
          </h1>
          <p className="mb-8 text-muted-foreground">
            You have been invited to collaborate in this workspace.
          </p>

          <Button
            className="w-full h-11 text-base font-semibold"
            size="lg"
            onClick={handleAccept}
            loading={isAccepting}
            loadingText="Joining Workspace..."
          >
            Accept Invitation
          </Button>

          <p className="mt-6 text-xs text-muted-foreground">
            Make sure you trust the sender before joining unrecognized
            workspaces.
          </p>
        </div>
        <div className="bg-muted/50 p-4 text-center text-xs text-muted-foreground/75">
          Powered by Weevean
        </div>
      </div>
    </div>
  );
}
