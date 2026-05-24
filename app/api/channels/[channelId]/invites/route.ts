import { authorizedApiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { createPrivateChannelInvite, getChannelById } from "@/lib/db/queries";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const createChannelInviteSchema = z.object({
  expiresInDays: z.number().int().min(1).max(30).optional().default(7),
  maxUses: z.number().int().min(1).max(100).optional(),
});

export const POST = authorizedApiHandler(async (req, ctx, session) => {
  const { channelId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { expiresInDays, maxUses } = createChannelInviteSchema.parse(body);

  const channel = await getChannelById(channelId);
  if (!channel) {
    return AppError.notFound("Channel not found").toResponse();
  }

  if (channel.type === "private") {
    const isChannelMember = channel.members?.some(
      (member) => member.userId === session.user.id,
    );
    if (!isChannelMember) {
      return AppError.forbidden(
        "You are not a member of this private channel",
      ).toResponse();
    }
  }

  const code = uuidv4().split("-")[0];

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const [invite] = await createPrivateChannelInvite({
    channelId,
    code,
    createdBy: session.user.id,
    expiresAt,
    maxUses,
  });

  return NextResponse.json({
    result: { data: invite },
  });
});
