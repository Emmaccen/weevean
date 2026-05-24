"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { useDMs, useWorkspaceMembers } from "@/lib/hooks";
import { fetcher, getUserInitials } from "@/lib/utils";
import { Loader2, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

interface NewDMModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function NewDMModal({
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: NewDMModalProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const workspaceId = searchParams.get("workspace");
  const { data: session } = useSession();

  const { members, isLoading } = useWorkspaceMembers(workspaceId || undefined);
  const { mutate: mutateDMs } = useDMs();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled && setControlledOpen) {
      setControlledOpen(newOpen);
    } else {
      setOpen(newOpen);
    }

    if (!newOpen) {
      setTimeout(() => setSearchQuery(""), 300);
    }
  };

  const filteredMembers = members?.filter((member) => {
    if (member.user.id === session?.user?.id) return false; // Hide self
    return member.user.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleStartDM = async (userId: string) => {
    setIsCreating(true);
    try {
      const dm = await fetcher<any>(
        "/api/dms",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        },
        "Failed to create DM",
      );

      handleOpenChange(false);

      mutateDMs();

      const params = new URLSearchParams(searchParams.toString());
      params.set("dm", dm.id);
      params.delete("channel");
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start conversation");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Direct Messages</DialogTitle>
          <DialogDescription>
            Search for people in this workspace to start a conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 flex-1 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredMembers?.length === 0 ? (
              <div className="text-center p-8 text-sm text-muted-foreground">
                No members found
              </div>
            ) : (
              filteredMembers?.map((member) => (
                <button
                  key={member.user.id}
                  onClick={() => handleStartDM(member.user.id)}
                  disabled={isCreating}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                >
                  <Avatar>
                    <AvatarImage
                      src={member.user.image || undefined}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback>
                      {getUserInitials(member.user.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {member.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.user.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NewDMModalWrapper(props: NewDMModalProps) {
  return (
    <Suspense fallback={null}>
      <NewDMModal {...props} />
    </Suspense>
  );
}
