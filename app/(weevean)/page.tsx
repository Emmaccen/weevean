"use client";

import AppHeaderPartial from "@/components/shared/app-header-partial";
import { ChatHeader } from "@/components/shared/channels-header";
import { MessageInput } from "@/components/shared/message-input";
import { MessageList } from "@/components/shared/message-list";
import { useSession } from "@/lib/auth-client";
import { useChannels, useDMMessages, useDMs, useMessages } from "@/lib/hooks";
import { fetcher } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channelId = searchParams.get("channel");
  const dmId = searchParams.get("dm");
  const workspaceId = searchParams.get("workspace");

  const isDM = !!dmId;
  const activeId = isDM ? dmId : channelId;

  const {
    messages: channelMessages,
    isLoading: isLoadingChannelMessages,
    mutate: mutateChannel,
  } = useMessages(channelId || undefined);

  const {
    messages: dmMessages,
    isLoading: isLoadingDMMessages,
    mutate: mutateDM,
  } = useDMMessages(dmId || undefined);

  const { channels } = useChannels(workspaceId || undefined);
  const { dms, mutate: mutateDMs } = useDMs();

  const { data: session } = useSession();

  const [messageDraft, setMessageDraft] = useState("");

  const normalizedDMMessages = useMemo(() => {
    if (!dmMessages) return [];
    return dmMessages.map((m: any) => ({
      ...m,
      user: m.sender || m.user,
      reactions: [],
      replyCount: 0,
    }));
  }, [dmMessages]);

  const messages = isDM ? normalizedDMMessages : channelMessages;
  const isLoadingMessages = isDM
    ? isLoadingDMMessages
    : isLoadingChannelMessages;
  const mutate = isDM ? mutateDM : mutateChannel;

  useEffect(() => {
    setMessageDraft("");
  }, [activeId]);

  const activeChat = useMemo(() => {
    if (isDM && dms) {
      const dm = dms.find((d: any) => d.id === dmId);
      if (!dm) return null;
      const otherUser =
        dm.participant1Id === session?.user?.id
          ? dm.participant2
          : dm.participant1;
      return {
        id: dm.id,
        name: otherUser?.name || "User",
        isPrivate: true,
        description: "",
      };
    }
    if (!isDM && channels) {
      const c = channels.find((ch) => ch.id === channelId);
      return c
        ? {
            id: c.id,
            name: c.name,
            isPrivate: c.type === "private",
            description: c.description || "",
            memberCount: c.memberCount,
          }
        : null;
    }
    return null;
  }, [channels, channelId, dms, dmId, session, isDM]);

  const handleSend = async (content: string) => {
    if (!activeId || !messages || !session?.user) return;

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
      replyCount: 0,
    };

    setMessageDraft("");

    try {
      await mutate(
        async () => {
          const apiPath = isDM
            ? `/api/dms/${dmId}/messages`
            : `/api/channels/${channelId}/messages`;

          const newMessage = await fetcher<typeof optimisticMessage>(
            apiPath,
            {
              method: "POST",
              body: JSON.stringify({ content }),
            },
            "Failed to send message",
          );
          return [newMessage, ...messages];
        },
        {
          optimisticData: [optimisticMessage, ...messages],
          rollbackOnError: true,
          revalidate: false,
        },
      );
    } catch (error) {
      console.error("Failed to send message", error);
      setMessageDraft(content);
    }
  };

  const handleUserClick = async (userId: string) => {
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

      mutateDMs();

      const params = new URLSearchParams(searchParams.toString());
      params.set("dm", dm.id);
      params.delete("channel");
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start conversation");
    }
  };

  if (!activeId) {
    return (
      <div className="flex h-full flex-col">
        <div className="sticky top-0 z-10">
          <AppHeaderPartial>
            <div className="flex w-full items-center px-4">
              <span className="font-semibold text-foreground">Welcome</span>
            </div>
          </AppHeaderPartial>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 text-center">
          Select a channel or conversation to start chatting
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10">
        <AppHeaderPartial>
          <ChatHeader
            channel={{
              id: activeChat?.id || activeId,
              isPrivate: activeChat?.isPrivate || false,
              isDM: isDM,
              name: activeChat?.name || (isDM ? "User" : "Channel"),
              description: activeChat?.description || "",
              memberCount: activeChat?.memberCount,
            }}
          />
        </AppHeaderPartial>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoadingMessages ? (
          <div className="flex h-full items-center justify-center">
            Loading messages...
          </div>
        ) : (
          <MessageList
            messages={isLoadingMessages ? [] : [...(messages || [])].reverse()}
            currentUserId={session?.user?.id || ""}
            onReact={() => null}
            onReply={() => null}
            onUserClick={handleUserClick}
          />
        )}
      </div>

      <div className="shrink-0">
        <MessageInput
          value={messageDraft}
          onChange={setMessageDraft}
          placeholder={`Message ${isDM ? "" : "#"}${activeChat?.name || "..."}`}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}

export default function HomeWrapper() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
