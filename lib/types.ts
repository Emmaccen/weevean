export type CommonErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limit"
  | "server_error";

export interface ApiResponse<T> {
  result: {
    data: T;
  };
}

import {
  Channels,
  DirectMessages,
  Users,
  WorkspaceInvites,
  WorkspaceMembers,
  Workspaces,
} from "./db/schema";

export type WorkspaceWithOwner = Workspaces & {
  owner: Users;
};

export type ChannelWithCreator = Channels & {
  creator: Users;
  memberCount?: number;
};

export type DMWithParticipants = DirectMessages & {
  participant1: Users;
  participant2: Users;
};

export type WorkspaceMemberWithUser = WorkspaceMembers & {
  user: Users;
};

export type WorkspaceInviteWithCreator = WorkspaceInvites & {
  creator: Users;
};
