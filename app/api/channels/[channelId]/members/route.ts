import { authorizedApiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getChannelById, getWorkspaceMembers } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export const GET = authorizedApiHandler(async (req, ctx, session) => {
  const { channelId } = await ctx.params;

  const channel = await getChannelById(channelId);
  if (!channel) {
    return AppError.notFound("Channel not found").toResponse();
  }

  let formattedMembers = [];

  if (channel.type === "public") {
    const wsMembers = await getWorkspaceMembers(channel.workspaceId);
    formattedMembers = wsMembers.map((m) => ({
      id: m.userId,
      name: m.user?.name || "User",
      email: m.user?.email || "",
      image: m.user?.image || null,
      joinedAt: m.joinedAt,
    }));
  } else {
    let members = channel.members || [];
    formattedMembers = members.map((m) => ({
      id: m.userId,
      name: m.user?.name || "User",
      email: m.user?.email || "",
      image: m.user?.image || null,
      joinedAt: m.joinedAt,
    }));
  }

  return NextResponse.json({
    result: { data: formattedMembers },
  });
});
