"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import {
  MessageSquareReply,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Response } from "./markdownRenderer";
import { MessageReactions } from "./message-reactions";

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  edited?: boolean;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
  reactions: Reaction[];
  parentId?: string;
  replyCount?: number;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onUserClick?: (userId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

function formatMessageDate(date: Date): string {
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  }
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

function shouldShowDateSeparator(
  currentMessage: Message,
  previousMessage?: Message,
): boolean {
  if (!previousMessage) return true;
  const currentDate = new Date(currentMessage.createdAt).toDateString();
  const previousDate = new Date(previousMessage.createdAt).toDateString();
  return currentDate !== previousDate;
}

function shouldGroupWithPrevious(
  currentMessage: Message,
  previousMessage?: Message,
): boolean {
  if (!previousMessage) return false;
  if (currentMessage.user.id !== previousMessage.user.id) return false;

  const timeDiff =
    new Date(currentMessage.createdAt).getTime() -
    new Date(previousMessage.createdAt).getTime();
  return timeDiff < 5 * 60 * 1000; // 5 minutes
}

function DateSeparator({ date }: { date: Date }) {
  const label = isToday(date)
    ? "Today"
    : isYesterday(date)
      ? "Yesterday"
      : format(date, "MMMM d, yyyy");

  return (
    <div className="relative my-6 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
      >
        {label}
      </motion.span>
    </div>
  );
}

export function MessageList({
  messages,
  currentUserId,
  onReact,
  onReply,
  onUserClick,
  onEdit,
  onDelete,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="flex flex-col gap-0.5 px-4 py-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const previousMessage = messages[index - 1];
            const showDateSeparator = shouldShowDateSeparator(
              message,
              previousMessage,
            );
            const isGrouped = shouldGroupWithPrevious(message, previousMessage);
            const isOwn = message.user?.id === currentUserId;

            return (
              <MessageItem
                key={message.id}
                message={message}
                isGrouped={isGrouped}
                showDateSeparator={showDateSeparator}
                isOwn={isOwn}
                onReact={onReact}
                onReply={onReply}
                onUserClick={onUserClick}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function MessageItem({
  message,
  isGrouped,
  showDateSeparator,
  isOwn,
  onReact,
  onReply,
  onUserClick,
  onEdit,
  onDelete,
}: {
  message: Message;
  isGrouped: boolean;
  showDateSeparator: boolean;
  isOwn: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onUserClick?: (userId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReactingOpen, setIsReactingOpen] = useState(false);

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(message.content);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
  };

  return (
    <div key={message.id} className="group relative">
      {showDateSeparator && (
        <DateSeparator date={new Date(message.createdAt)} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative flex gap-3 rounded-lg px-4 py-2 transition-colors group-hover:bg-secondary/50",
          isGrouped && "mt-0.5",
        )}
      >
        <div className="w-10 shrink-0">
          {!isGrouped && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                !isOwn &&
                  onUserClick &&
                  "cursor-pointer hover:opacity-80 transition-opacity",
              )}
              onClick={() => !isOwn && onUserClick?.(message.user.id)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={message.user.image || undefined}
                  alt={message.user.name}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {message.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {!isGrouped && (
            <div className="mb-1 flex items-baseline gap-2">
              <span
                className={cn(
                  "font-semibold",
                  isOwn ? "text-primary" : "text-foreground",
                  !isOwn && onUserClick && "cursor-pointer hover:underline",
                )}
                onClick={() => !isOwn && onUserClick?.(message.user.id)}
              >
                {message.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatMessageDate(new Date(message.createdAt))}
              </span>
            </div>
          )}

          {isEditing ? (
            <div className="mt-1 flex flex-col gap-2 w-full max-w-2xl">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] resize-none bg-background focus-visible:ring-1"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEditSubmit}>
                  Save changes
                </Button>
                <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                  escape to cancel, enter to save
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-foreground/90 flex flex-wrap items-baseline gap-2">
              <Response>{message.content}</Response>
              {message.edited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>
          )}

          {message.reactions.length > 0 && (
            <MessageReactions
              reactions={message.reactions}
              onReact={(emoji) => onReact(message.id, emoji)}
            />
          )}

          {(message.replyCount ?? 0) > 0 && (
            <button
              onClick={() => onReply?.(message.id)}
              className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <span>
                {message.replyCount}{" "}
                {message.replyCount === 1 ? "reply" : "replies"}
              </span>
            </button>
          )}
        </div>

        <div
          className={cn(
            "absolute -top-4 right-4 items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm z-10",
            isMenuOpen || isDeleteDialogOpen || isReactingOpen
              ? "flex"
              : "hidden group-hover:flex",
          )}
        >
          <MessageReactions
            reactions={[]}
            onReact={(emoji) => onReact(message.id, emoji)}
            showQuickPicker
            onOpenChange={setIsReactingOpen}
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onReply?.(message.id)}
          >
            <MessageSquareReply className="h-4 w-4 text-muted-foreground" />
          </Button>

          {isOwn && (
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isOwn ? "end" : "start"}
                  className="w-32 bg-card border-border z-50"
                >
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsMenuOpen(false);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Message</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this message? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDelete?.(message.id);
                      setIsDeleteDialogOpen(false);
                    }}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>
    </div>
  );
}
