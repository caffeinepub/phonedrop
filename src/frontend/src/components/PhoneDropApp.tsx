import { ReceiveTab } from "@/components/ReceiveTab";
import { SendTab } from "@/components/SendTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

export function PhoneDropApp() {
  const { actor } = useActor();

  useEffect(() => {
    if (actor) {
      actor.cleanupExpiredEntries().catch(() => {
        // silent cleanup
      });
    }
  }, [actor]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.18 195) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.18 155) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 pt-12 pb-6 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <motion.img
            src="/assets/generated/phonedrop-logo-transparent.dim_120x120.png"
            alt="PhoneDrop"
            className="w-10 h-10 animate-float"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Phone<span className="text-primary">Drop</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm font-body">
          Instant file transfers between devices
        </p>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 pb-8 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="send" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6 bg-secondary/50 p-1 rounded-2xl h-14">
              <TabsTrigger
                value="send"
                data-ocid="send.tab"
                className="rounded-xl text-sm font-medium flex items-center gap-2 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-sm transition-all duration-200"
              >
                <ArrowUpFromLine className="w-4 h-4" />
                Send File
              </TabsTrigger>
              <TabsTrigger
                value="receive"
                data-ocid="receive.tab"
                className="rounded-xl text-sm font-medium flex items-center gap-2 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-sm transition-all duration-200"
              >
                <ArrowDownToLine className="w-4 h-4" />
                Receive File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="mt-0">
              <SendTab />
            </TabsContent>

            <TabsContent value="receive" className="mt-0">
              <ReceiveTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
