import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActor } from "@/hooks/useActor";
import { formatFileSize } from "@/lib/fileUtils";
import { getMimeIcon } from "@/lib/mimeIcons";
import { AlertCircle, Clock, Download, Loader2, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type FileInfo = {
  fileName: string;
  fileSize: bigint;
  mimeType: string;
  timestamp: bigint;
};

type ReceiveState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "found"; info: FileInfo; code: string }
  | { phase: "error"; message: string }
  | { phase: "downloading"; info: FileInfo; code: string };

export function ReceiveTab() {
  const { actor } = useActor();
  const [code, setCode] = useState("");
  const [state, setState] = useState<ReceiveState>({ phase: "idle" });

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setCode(val);
    if (state.phase === "error") setState({ phase: "idle" });
  };

  const handleFind = async () => {
    if (!actor || code.length < 6) return;
    setState({ phase: "loading" });
    try {
      const info = await actor.getFileInfo(code);
      setState({ phase: "found", info, code });
    } catch {
      setState({
        phase: "error",
        message: "File not found or has expired. Check the code and try again.",
      });
    }
  };

  const handleDownload = async () => {
    if ((state.phase !== "found" && state.phase !== "downloading") || !actor)
      return;
    const { info, code: shareCode } = state;
    setState({ phase: "downloading", info, code: shareCode });
    try {
      const blobRef = await actor.getBlobReference(shareCode);
      const bytes = await blobRef.getBytes();
      const blob = new Blob([bytes], {
        type: info.mimeType || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = info.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast.success("Download started!");
      setState({ phase: "found", info, code: shareCode });
    } catch {
      toast.error("Download failed. Please try again.");
      setState({ phase: "found", info, code: shareCode });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && code.length === 6) handleFind();
  };

  const foundInfo =
    state.phase === "found" || state.phase === "downloading"
      ? state.info
      : null;

  return (
    <div className="space-y-4">
      {/* Code Input Area */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-body uppercase tracking-wider">
            Enter Share Code
          </p>
          <Input
            data-ocid="receive.input"
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            placeholder="ABC123"
            maxLength={6}
            disabled={
              state.phase === "loading" || state.phase === "downloading"
            }
            className="
              font-mono text-3xl font-bold tracking-[0.3em] text-center h-16
              bg-secondary border-border rounded-xl placeholder:text-muted-foreground/30
              focus:border-primary focus:ring-primary focus:shadow-glow-sm
              uppercase
            "
          />
        </div>
        <Button
          data-ocid="receive.submit_button"
          onClick={handleFind}
          disabled={code.length < 6 || state.phase === "loading" || !actor}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-display font-semibold shadow-glow-sm disabled:opacity-40 transition-all duration-200 active:scale-[0.98]"
        >
          {state.phase === "loading" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Search className="w-4 h-4 mr-2" />
          )}
          {state.phase === "loading" ? "Searching..." : "Find File"}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {/* Loading State */}
        {state.phase === "loading" && (
          <motion.div
            key="loading"
            data-ocid="receive.loading_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-card border border-border rounded-2xl p-6 flex items-center justify-center gap-3"
          >
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-muted-foreground font-body">
              Looking up file...
            </span>
          </motion.div>
        )}

        {/* Error State */}
        {state.phase === "error" && (
          <motion.div
            key="error"
            data-ocid="receive.error_state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-display font-semibold text-destructive text-sm">
                File Not Found
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-body">
                {state.message}
              </p>
            </div>
          </motion.div>
        )}

        {/* Success / File Found State */}
        {foundInfo && (
          <motion.div
            key="found"
            data-ocid="receive.success_state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-primary/30 rounded-2xl p-6 space-y-5"
          >
            {/* File Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                {getMimeIcon(foundInfo.mimeType, "w-6 h-6 text-primary")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-foreground truncate">
                  {foundInfo.fileName}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(Number(foundInfo.fileSize))}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {foundInfo.mimeType.split("/")[0]}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>This file expires 24 hours after upload</span>
            </div>

            <Button
              data-ocid="receive.primary_button"
              onClick={handleDownload}
              disabled={state.phase === "downloading"}
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-display font-semibold text-base shadow-glow transition-all duration-200 active:scale-[0.98]"
            >
              {state.phase === "downloading" ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              {state.phase === "downloading"
                ? "Preparing Download..."
                : "Download File"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
