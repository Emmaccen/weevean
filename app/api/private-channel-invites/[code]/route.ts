import { authorizedApiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { db } from "@/lib/db";
import {
  getPrivateChannelInviteByCode,
  incrementPrivateChannelInviteUses,
} from "@/lib/db/queries";
import { channelMembers } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export const GET = authorizedApiHandler(async (req, ctx, session) => {
  const { code } = await ctx.params;

  const invite = await getPrivateChannelInviteByCode(code);
  if (!invite) {
    return AppError.notFound("Invalid or expired invite code.").toResponse();
  }

  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return AppError.badRequest("This invite code has expired.").toResponse();
  }
  if (invite.maxUses && invite.uses >= invite.maxUses) {
    return AppError.badRequest(
      "This invite code has reached its maximum number of uses.",
    ).toResponse();
  }

  return NextResponse.json({
    result: {
      data: {
        channelName: invite.channel.name,
        workspaceName: invite.channel.workspace.name,

        isAlreadyMember: invite.channel.members?.some(
          (member) => member.userId === session.user.id,
        ),
      },
    },
  });
});

export const POST = authorizedApiHandler(async (req, ctx, session) => {
  const { code } = await ctx.params;

  const invite = await getPrivateChannelInviteByCode(code);
  if (!invite) {
    return AppError.notFound("Invalid or expired invite code.").toResponse();
  }

  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return AppError.badRequest("This invite code has expired.").toResponse();
  }

  if (invite.maxUses && invite.uses >= invite.maxUses) {
    return AppError.badRequest(
      "This invite code has reached its maximum number of uses.",
    ).toResponse();
  }

  const isMember = invite.channel.members?.some(
    (member) => member.userId === session.user.id,
  );

  if (!isMember) {
    await db.insert(channelMembers).values({
      channelId: invite.channelId,
      userId: session.user.id,
    });

    await incrementPrivateChannelInviteUses(invite.id);
  }

  return NextResponse.json({
    result: {
      data: {
        workspaceId: invite.channel.workspaceId,
        channelId: invite.channelId,
      },
    },
  });
});
