"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover";
import { Button } from "@/components/ui/button";
import { QUICK_EMOJIS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Plus, SmilePlus } from "lucide-react";
import { motion } from "motion/react";

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  showQuickPicker?: boolean;
  onOpenChange?: (open: boolean) => void;
}



export function MessageReactions({
  reactions,
  onReact,
  showQuickPicker,
  onOpenChange,
}: MessageReactionsProps) {
  if (showQuickPicker) {
    return (
      <div className="flex items-center gap-0.5">
        {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onReact(emoji)}
            className="flex h-7 w-7 items-center justify-center rounded text-sm transition-colors hover:bg-secondary"
          >
            {emoji}
          </motion.button>
        ))}
        <Popover onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <SmilePlus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto border-border bg-card p-2"
            align="end"
          >
            <div className="grid grid-cols-4 gap-1">
              {QUICK_EMOJIS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReact(emoji)}
                  className="flex h-8 w-8 items-center justify-center rounded text-lg transition-colors hover:bg-secondary"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      {reactions.map((reaction) => (
        <motion.button
          key={reaction.emoji}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onReact(reaction.emoji)}
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all",
            reaction.userReacted
              ? "border border-primary/50 bg-primary/20 text-primary"
              : "border border-border bg-secondary text-muted-foreground hover:border-primary/30",
          )}
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </motion.button>
      ))}

      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </motion.button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border-border bg-card p-2"
          align="start"
        >
          <div className="grid grid-cols-4 gap-1">
            {QUICK_EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onReact(emoji)}
                className="flex h-8 w-8 items-center justify-center rounded text-lg transition-colors hover:bg-secondary"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
