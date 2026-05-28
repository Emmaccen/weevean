"use client";

import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/animate/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover";
import { Button } from "@/components/ui/button";
import { QUICK_EMOJIS } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AtSign,
  Bold,
  Code,
  Italic,
  Link,
  List,
  ListOrdered,
  Send,
  Smile,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface MessageInputProps {
  placeholder?: string;
  onSend: (content: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  showAiTrigger?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const FORMATTING_TOOLS = [
  { icon: Bold, label: "Bold", shortcut: "Ctrl+B", wrapper: ["**", "**"] },
  { icon: Italic, label: "Italic", shortcut: "Ctrl+I", wrapper: ["*", "*"] },
  { icon: Code, label: "Code", shortcut: "Ctrl+E", wrapper: ["`", "`"] },
  { icon: Link, label: "Link", shortcut: "Ctrl+K", wrapper: ["[", "](url)"] },
  { icon: List, label: "Bullet list", shortcut: "", wrapper: ["- ", ""] },
  {
    icon: ListOrdered,
    label: "Numbered list",
    shortcut: "",
    wrapper: ["1. ", ""],
  },
];

export function MessageInput({
  placeholder = "Write a message...",
  onSend,
  onTyping,
  disabled,
  showAiTrigger = true,
  value: controlledValue,
  onChange: setControlledValue,
}: MessageInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = controlledValue !== undefined;
  const content = isControlled ? controlledValue : internalValue;
  const setContent = (newValue: string) => {
    if (isControlled) {
      setControlledValue?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const [isFocused, setIsFocused] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [content, adjustHeight]);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      if (!isControlled) {
        setContent("");
      }
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    if (e.ctrlKey || e.metaKey) {
      const tool = FORMATTING_TOOLS.find((t) =>
        t.shortcut.toLowerCase().includes(e.key.toLowerCase()),
      );
      if (tool) {
        e.preventDefault();
        applyFormatting(tool.wrapper);
      }
    }
  };

  const applyFormatting = (wrapper: string[]) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const newText = `${beforeText}${wrapper[0]}${selectedText}${wrapper[1]}${afterText}`;
    setContent(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + wrapper[0].length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = content.substring(0, start);
    const afterText = content.substring(start);

    setContent(`${beforeText}${emoji}${afterText}`);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertAiMention = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = content.substring(0, start);
    const afterText = content.substring(start);
    const mention = "@ai ";

    setContent(`${beforeText}${mention}${afterText}`);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + mention.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping?.();
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="border-t border-border bg-background p-4"
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
      >
        <div
          className={cn(
            "relative rounded-xl border transition-all duration-200",
            isFocused
              ? "border-primary/50 bg-card shadow-lg shadow-primary/5"
              : "border-border bg-card/50",
          )}
        >
          <AnimatePresence>
            {(isFocused || content.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.25, type: "spring", bounce: 0.2 }}
                className="flex items-center gap-0.5 border-b border-border px-2 py-1.5"
              >
                {FORMATTING_TOOLS.map((tool) => (
                  <Tooltip key={tool.label}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        onClick={() => applyFormatting(tool.wrapper)}
                      >
                        <tool.icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      <p>
                        {tool.label}
                        {tool.shortcut && (
                          <span className="ml-2 text-muted-foreground">
                            {tool.shortcut}
                          </span>
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}

                <div className="mx-1 h-4 w-px bg-border" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <AtSign className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    <p>Mention someone</p>
                  </TooltipContent>
                </Tooltip>

                {showAiTrigger && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                        onClick={insertAiMention}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      <p>Ask AI assistant</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2 p-3">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="max-h-[200px] min-h-[24px] flex-1 resize-none border-0 bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
              rows={1}
            />

            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto border-border bg-card p-2"
                  align="end"
                  side="top"
                >
                  <div className="grid grid-cols-6 gap-1">
                    {QUICK_EMOJIS.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => insertEmoji(emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded text-lg transition-colors hover:bg-secondary"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="icon"
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-lg transition-all",
                    content.trim()
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-muted-foreground",
                  )}
                  onClick={handleSubmit}
                  disabled={!content.trim() || disabled}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          Press{" "}
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
            Enter
          </kbd>{" "}
          to send,{" "}
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
            Shift + Enter
          </kbd>{" "}
          for new line
        </p>
      </motion.div>
    </TooltipProvider>
  );
}
