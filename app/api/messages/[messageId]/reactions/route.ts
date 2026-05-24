import { authorizedApiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import {
  addReaction,
  getMessageById,
  isWorkspaceMember,
  removeReaction,
} from "@/lib/db/queries";
import { NextResponse } from "next/server";
import { z } from "zod";

const reactionSchema = z.object({
  emoji: z.string().min(1).max(10),
  action: z.enum(["add", "remove"]),
});

export const POST = authorizedApiHandler(async (req, ctx, session) => {
  const { messageId } = await ctx.params;
  const body = await req.json();
  const { emoji, action } = reactionSchema.parse(body);

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

  if (action === "add") {
    try {
      await addReaction({
        messageId,
        userId: session.user.id,
        emoji,
      });
    } catch (e) {
      // Ignore unique constraint violation
    }
  } else {
    await removeReaction(messageId, session.user.id, emoji);
  }

  return NextResponse.json({
    result: { success: true },
  });
});
