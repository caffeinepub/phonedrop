import { ExternalBlob } from "@/backend";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useActor } from "@/hooks/useActor";
import { formatFileSize } from "@/lib/fileUtils";
import { getMimeIcon } from "@/lib/mimeIcons";
import {
  CheckCircle2,
  Clock,
  Copy,
  FileUp,
  RefreshCw,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type SendState =
  | { phase: "idle" }
  | { phase: "uploading"; file: File; progress: number }
  | { phase: "success"; code: string; fileName: string };

export function SendTab() {
  const { actor } = useActor();
  const [state, setState] = useState<SendState>({ phase: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!actor) return;

      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const blob = ExternalBlob.fromBytes(uint8).withUploadProgress(
        (percentage: number) => {
          setState((prev) =>
            prev.phase === "uploading"
              ? { phase: "uploading", file, progress: Math.round(percentage) }
              : prev,
          );
        },
      );

      setState({ phase: "uploading", file, progress: 0 });

      try {
        const code = await actor.createShare(
          blob,
          file.name,
          BigInt(file.size),
          file.type || "application/octet-stream",
        );
        setState({ phase: "success", code, fileName: file.name });
      } catch {
        toast.error("Upload failed. Please try again.");
        setState({ phase: "idle" });
      }
    },
    [actor],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleReset = () => {
    setState({ phase: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopyCode = () => {
    if (state.phase !== "success") return;
    navigator.clipboard.writeText(state.code);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* Success State */}
        {state.phase === "success" && (
          <motion.div
            key="success"
            data-ocid="send.success_state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-2xl p-8 text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            </motion.div>

            <div>
              <p className="text-muted-foreground text-sm mb-1 font-body">
                Share this code
              </p>
              <div
                className="font-mono text-5xl font-bold text-primary glow-text-teal py-4 select-all"
                style={{ letterSpacing: "0.3em" }}
              >
                {state.code}
              </div>
              <p className="text-xs text-muted-foreground font-body">
                {state.fileName}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Expires in 24 hours</span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCopyCode}
                data-ocid="send.primary_button"
                className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium shadow-glow-sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
              <Button
                onClick={handleReset}
                data-ocid="send.secondary_button"
                variant="outline"
                className="h-12 px-4 rounded-xl border-border hover:bg-secondary"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Idle State */}
        {state.phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload-input"
              className="sr-only"
              onChange={handleFileInput}
            />
            <label
              htmlFor="file-upload-input"
              data-ocid="send.dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative min-h-[220px] rounded-2xl border-2 border-dashed transition-all duration-200
                flex flex-col items-center justify-center gap-4 p-8 cursor-pointer
                ${
                  isDragging
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border bg-card hover:border-primary/40 hover:bg-card/80"
                }
              `}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <FileUp className="w-7 h-7 text-primary" />
              </motion.div>
              <div className="text-center">
                <p className="font-display text-lg font-semibold text-foreground">
                  {isDragging ? "Drop to upload" : "Tap or drop a file"}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Uploads instantly
                </p>
              </div>
            </label>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
              <Clock className="w-3.5 h-3.5" />
              <span>Files expire after 24 hours</span>
            </div>
          </motion.div>
        )}

        {/* Uploading State */}
        {state.phase === "uploading" && (
          <motion.div
            key="uploading"
            data-ocid="send.loading_state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-2xl p-8 text-center space-y-6"
          >
            <motion.div
              className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              <Upload className="w-7 h-7 text-primary" />
            </motion.div>
            <div>
              <p className="font-display font-semibold text-foreground">
                Uploading...
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {state.file.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {getMimeIcon(state.file.type, "inline w-3.5 h-3.5 mr-1")}
                {formatFileSize(state.file.size)} &middot; {state.progress}%
              </p>
            </div>
            <Progress
              value={state.progress}
              className="h-2 rounded-full bg-secondary [&>[data-progress]]:bg-primary"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
