import { cn } from "../lib/cn";

const TONE_CLASS = {
  muted: "text-muted",
  warn: "text-warn",
  ok: "text-ok",
  alert: "text-alert",
} as const;

interface StatusBarProps {
  text: string;
  tone: keyof typeof TONE_CLASS;
}

export function StatusBar({ text, tone }: StatusBarProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-panel/60 px-3 py-2 text-xs font-mono",
        TONE_CLASS[tone],
      )}
    >
      {text}
    </div>
  );
}
