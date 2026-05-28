import { authorizedApiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import {
  deleteMessage,
  getMessageById,
  isWorkspaceMember,
  updateMessage,
} from "@/lib/db/queries";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

export const GET = authorizedApiHandler(async (req, ctx, session) => {
  const { messageId } = await ctx.params;

  const message = await getMessageById(messageId);
  if (!message) {
    return AppError.notFound("Message not found").toResponse();
  }

  const isMember = await isWorkspaceMember(
    message.channel.workspaceId,
    session.user.id,
  );
  if (!isMember) {
    return AppError.forbidden("Unauthorized").toResponse();
  }

  // Format reactions
  const reactionGroups =
    message.reactions?.reduce(
      (acc, curr) => {
        if (!acc[curr.emoji]) acc[curr.emoji] = [];
        acc[curr.emoji].push(curr.userId);
        return acc;
      },
      {} as Record<string, string[]>,
    ) || {};

  const formattedReactions = Object.entries(reactionGroups).map(
    ([emoji, userIds]) => ({
      emoji,
      count: userIds.length,
      userReacted: userIds.includes(session.user.id),
    }),
  );

  return NextResponse.json({
    result: {
      data: {
        ...message,
        reactions: formattedReactions,
      },
    },
  });
});

export const PATCH = authorizedApiHandler(async (req, ctx, session) => {
  const { messageId } = await ctx.params;
  const body = await req.json();
  const { content } = updateMessageSchema.parse(body);

  const message = await getMessageById(messageId);
  if (!message) {
    return AppError.notFound("Message not found").toResponse();
  }

  if (message.userId !== session.user.id) {
    return AppError.forbidden(
      "You can only edit your own messages",
    ).toResponse();
  }

  const isMember = await isWorkspaceMember(
    message.channel.workspaceId,
    session.user.id,
  );
  if (!isMember) {
    return AppError.forbidden("Unauthorized").toResponse();
  }

  const [updatedMessage] = await updateMessage(messageId, content);

  return NextResponse.json({
    result: { data: updatedMessage },
  });
});

export const DELETE = authorizedApiHandler(async (req, ctx, session) => {
  const { messageId } = await ctx.params;

  const message = await getMessageById(messageId);
  if (!message) {
    return AppError.notFound("Message not found").toResponse();
  }

  const isMember = await isWorkspaceMember(
    message.channel.workspaceId,
    session.user.id,
  );
  if (!isMember) {
    return AppError.forbidden("Unauthorized").toResponse();
  }

  if (message.userId !== session.user.id) {
    return AppError.forbidden(
      "You can only delete your own messages",
    ).toResponse();
  }

  await deleteMessage(messageId);

  return NextResponse.json({
    result: { success: true },
  });
});
