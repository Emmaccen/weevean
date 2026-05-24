"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetcher } from "@/lib/utils";
import { format } from "date-fns";
import { MessageSquare, X } from "lucide-react";
import useSWR from "swr";

interface Member {
  id: string;
  name: string;
  email: string;
  image: string | null;
  joinedAt: string;
}

export function MemberPanel({
  channelId,
  onClose,
  onUserClick,
}: {
  channelId: string | null;
  onClose: () => void;
  onUserClick: (userId: string) => void;
}) {
  const { data: members = [], isLoading } = useSWR(
    channelId ? `/api/channels/${channelId}/members` : null,
    (url) => fetcher<Member[]>(url),
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <h3 className="font-semibold">Channel Members</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col p-4 gap-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No members found
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={member.image || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{member.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {member.email}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Joined {format(new Date(member.joinedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => onUserClick(member.id)}
                  title="Message"
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
