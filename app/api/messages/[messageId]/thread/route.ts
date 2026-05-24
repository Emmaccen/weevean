import { authorizedApiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getMessageById, getThreadMessages } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export const GET = authorizedApiHandler(async (req, ctx, session) => {
  const { messageId } = await ctx.params;

  const parentMessage = await getMessageById(messageId);
  if (!parentMessage) {
    return AppError.notFound("Message not found").toResponse();
  }

  // Basic authorization check (ideally check if user is in channel)
  const threadMessages = await getThreadMessages(messageId);

  const formattedMessages = threadMessages.map((msg) => {
    const reactionGroups = msg.reactions.reduce(
      (acc, curr) => {
        if (!acc[curr.emoji]) acc[curr.emoji] = [];
        acc[curr.emoji].push(curr.userId);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const formattedReactions = Object.entries(reactionGroups).map(
      ([emoji, userIds]) => ({
        emoji,
        count: userIds.length,
        userReacted: userIds.includes(session.user.id),
      }),
    );

    return {
      ...msg,
      reactions: formattedReactions,
    };
  });

  return NextResponse.json({
    result: { data: formattedMessages },
  });
});
