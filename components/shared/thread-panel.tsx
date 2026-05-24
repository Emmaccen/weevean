"use client";

import { useSession } from "@/lib/auth-client";
import { fetcher } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "../ui/button";
import { MessageInput } from "./message-input";
import { Message, MessageList } from "./message-list";

export function ThreadPanel({
  parentMessageId,
  channelId,
  onClose,
}: {
  parentMessageId: string;
  channelId: string | null;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [messageDraft, setMessageDraft] = useState("");

  const { data: parentMessage, isLoading: isParentLoading } = useSWR(
    `/api/messages/${parentMessageId}`,
    (url) => fetcher<Message>(url),
  );

  const {
    data: messages = [],
    isLoading: isThreadLoading,
    mutate,
  } = useSWR(`/api/messages/${parentMessageId}/thread`, (url) =>
    fetcher<Message[]>(url),
  );

  const handleSend = async (content: string) => {
    if (!channelId || !session?.user) return;

    const optimisticMessage = {
      id: "optimistic-" + Date.now(),
      content,
      createdAt: new Date(),
      user: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      },
      reactions: [],
      parentId: parentMessageId,
    };

    setMessageDraft("");

    try {
      await mutate(
        async () => {
          const apiPath = `/api/channels/${channelId}/messages`;

          const newMessage = await fetcher<typeof optimisticMessage>(
            apiPath,
            {
              method: "POST",
              body: JSON.stringify({ content, parentId: parentMessageId }),
            },
            "Failed to send reply",
          );
          return [...messages, newMessage];
        },
        {
          optimisticData: [...messages, optimisticMessage],
          rollbackOnError: true,
          revalidate: false,
        },
      );
    } catch (error) {
      setMessageDraft(content);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    // Basic optimistic reaction logic for threads
    const message = messages.find((m) => m.id === messageId);
    if (!message || !session?.user) return;

    const existingReaction = message.reactions?.find(
      (r) => r.emoji === emoji && r.userReacted,
    );
    const isAdd = !existingReaction;

    const newMessages = messages.map((m) => {
      if (m.id !== messageId) return m;

      let newReactions = m.reactions ? [...m.reactions] : [];
      const reactionIndex = newReactions.findIndex((r) => r.emoji === emoji);

      if (isAdd) {
        if (reactionIndex > -1) {
          newReactions[reactionIndex] = {
            ...newReactions[reactionIndex],
            count: newReactions[reactionIndex].count + 1,
            userReacted: true,
          };
        } else {
          newReactions.push({ emoji, count: 1, userReacted: true });
        }
      } else {
        if (reactionIndex > -1) {
          const newCount = newReactions[reactionIndex].count - 1;
          if (newCount <= 0) {
            newReactions.splice(reactionIndex, 1);
          } else {
            newReactions[reactionIndex] = {
              ...newReactions[reactionIndex],
              count: newCount,
              userReacted: false,
            };
          }
        }
      }

      return { ...m, reactions: newReactions };
    });

    try {
      await mutate(
        async () => {
          await fetcher(
            `/api/messages/${messageId}/reactions`,
            {
              method: "POST",
              body: JSON.stringify({ emoji, action: isAdd ? "add" : "remove" }),
            },
            "Failed to update reaction",
          );
          return newMessages;
        },
        {
          optimisticData: newMessages,
          rollbackOnError: true,
          revalidate: false,
        },
      );
    } catch (error) {
      toast.error("Failed to update reaction");
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <h3 className="font-semibold">Thread</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isParentLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading thread...
          </div>
        ) : parentMessage ? (
          <>
            <MessageList
              messages={[parentMessage]}
              currentUserId={session?.user?.id || ""}
              onReact={() => null} // Parent reactions should ideally update in main view too
            />
            <div className="flex items-center gap-4 px-4 my-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">
                {messages.length} replies
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {isThreadLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading replies...
              </div>
            ) : (
              <MessageList
                messages={messages}
                currentUserId={session?.user?.id || ""}
                onReact={handleReact}
              />
            )}
          </>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Message not found
          </div>
        )}
      </div>

      <div className="shrink-0">
        <MessageInput
          value={messageDraft}
          onChange={setMessageDraft}
          placeholder="Reply in thread..."
          onSend={handleSend}
        />
      </div>
    </div>
  );
}
