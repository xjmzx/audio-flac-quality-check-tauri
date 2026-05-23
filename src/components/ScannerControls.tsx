import { useEffect, useRef, useState } from "react";
import { FolderOpen, RefreshCw, ScanLine } from "lucide-react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { Section } from "./Section";
import { cn } from "../lib/cn";
import {
  onScanProgress,
  saveReport,
  scanLibrary,
  type ScanProgress,
  type ScanReport,
} from "../lib/tauri";

interface ScannerControlsProps {
  root: string;
  setRoot: (s: string) => void;
  onReport: (r: ScanReport) => void;
  onStatus: (s: { text: string; tone: "muted" | "warn" | "ok" | "alert" }) => void;
}

export function ScannerControls({ root, setRoot, onReport, onStatus }: ScannerControlsProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const unlistenRef = useRef<(() => void) | null>(null);

  // Ctrl+R rescans (matches the Tk app's shortcut).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        startScan();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, scanning]);

  async function browse() {
    const picked = await openDialog({
      directory: true,
      multiple: false,
      title: "Choose music library root",
      defaultPath: root || undefined,
    });
    if (typeof picked === "string") setRoot(picked);
  }

  async function startScan() {
    if (scanning || !root.trim()) return;
    setScanning(true);
    setProgress(null);
    onStatus({ text: "starting scan…", tone: "warn" });

    try {
      const unlisten = await onScanProgress((p) => setProgress(p));
      unlistenRef.current = unlisten;
      const report = await scanLibrary(root.trim());
      onReport(report);
      await saveReport(report);
      onStatus({
        text: `scan complete · ${report.rows.length.toLocaleString()} files`,
        tone: "ok",
      });
    } catch (e) {
      onStatus({ text: `scan failed: ${e}`, tone: "alert" });
    } finally {
      setScanning(false);
      setProgress(null);
      unlistenRef.current?.();
      unlistenRef.current = null;
    }
  }

  const pct = progress ? Math.round((100 * progress.done) / Math.max(1, progress.total)) : 0;

  return (
    <Section title="Scanner" icon={<ScanLine size={16} />}>
      <div className="flex gap-2">
        <input
          type="text"
          value={root}
          onChange={(e) => setRoot(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startScan()}
          placeholder="/path/to/music"
          disabled={scanning}
          className="flex-1 px-3 py-2 rounded-md bg-surface text-fg
                     placeholder:text-muted outline-none border border-transparent
                     focus:border-accent/50 disabled:opacity-50"
          spellCheck={false}
        />
        <button
          onClick={browse}
          disabled={scanning}
          className="px-3 py-2 rounded-md bg-surface hover:bg-surfaceHover
                     text-fg disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-1.5"
          title="Browse for folder"
        >
          <FolderOpen size={14} />
          Browse
        </button>
        <button
          onClick={startScan}
          disabled={scanning || !root.trim()}
          className={cn(
            "px-3 py-2 rounded-md font-semibold",
            "flex items-center gap-1.5",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "bg-accent text-bg hover:opacity-90",
          )}
          title="Re-scan (Ctrl+R)"
        >
          <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
          {scanning ? "scanning…" : "Re-scan"}
        </button>
      </div>

      {scanning && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted font-mono">
            <span className="truncate">
              {progress
                ? `${progress.done.toLocaleString()} / ${progress.total.toLocaleString()} · ${progress.path}`
                : "discovering files…"}
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-bg/60 overflow-hidden">
            <div
              className="h-full bg-accent transition-[width] duration-150"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </Section>
  );
}
