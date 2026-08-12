import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { Shield, Download, Trash2, Lock, Key, FileArchive } from "lucide-react";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Settings() {
  const { user, logout } = useAuth();
  const exportMutation = trpc.archive.export.useMutation();
  const deleteMutation = trpc.account.delete.useMutation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportMutation.mutateAsync();
      const a = document.createElement("a");
      a.href = result.url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Archive downloaded successfully.");
    } catch (err) {
      toast.error("Failed to export archive.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      toast.success("Account deleted. Your data has been removed.");
      window.location.href = "/";
    } catch (err) {
      toast.error("Failed to delete account.");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="font-serif-sacred text-2xl text-foreground mb-10 tracking-wide">Settings</h1>

      {/* User info */}
      <div className="mb-10 glass rounded-xl p-5">
        <p className="text-sm text-foreground/90 font-serif-sacred tracking-wide">{user?.name || "Anonymous"}</p>
        <p className="text-xs text-muted-foreground/50 mt-1 font-light">{user?.email || ""}</p>
      </div>

      {/* Privacy & Encryption */}
      <div className="mb-10">
        <h2 className="font-serif-sacred text-sm text-foreground/80 mb-5 tracking-wide flex items-center gap-2.5">
          <Shield className="h-4 w-4 text-amber/50" strokeWidth={1.5} />
          Privacy & Encryption
        </h2>
        <div className="glass rounded-xl p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-amber/5 border border-amber/10 flex items-center justify-center shrink-0 mt-0.5">
              <Key className="h-3.5 w-3.5 text-amber/50" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-foreground/90 font-medium">Client-side encryption</p>
              <p className="text-xs text-muted-foreground/60 mt-1.5 font-light leading-relaxed">
                Future Self letters are encrypted in your browser before upload.
                The server never has access to the plaintext audio before the unlock date.
                Your voice is protected end-to-end.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-amber/5 border border-amber/10 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="h-3.5 w-3.5 text-amber/50" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-foreground/90 font-medium">True time-lock</p>
              <p className="text-xs text-muted-foreground/60 mt-1.5 font-light leading-relaxed">
                Sealed letters are cryptographically enforced on the server.
                No one — not you, not an admin — can open a letter before its unlock date.
                The lock is real, not decorative.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-amber/5 border border-amber/10 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="h-3.5 w-3.5 text-amber/50" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-foreground/90 font-medium">No third-party access</p>
              <p className="text-xs text-muted-foreground/60 mt-1.5 font-light leading-relaxed">
                No analytics SDKs touch your voice data.
                No ads. No tracking of your content.
                Your echoes belong only to you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Archive Export */}
      <div className="mb-10">
        <h2 className="font-serif-sacred text-sm text-foreground/80 mb-5 tracking-wide flex items-center gap-2.5">
          <FileArchive className="h-4 w-4 text-amber/50" strokeWidth={1.5} />
          Your Archive
        </h2>
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-foreground/90 mb-2 font-medium">Export your entire vault</p>
          <p className="text-xs text-muted-foreground/50 mb-5 font-light leading-relaxed">
            Download a complete archive of all your echoes — audio files, transcripts,
            and metadata — in a portable ZIP format. Your memories, always yours.
          </p>
          <Button
            onClick={handleExport}
            disabled={isExporting || exportMutation.isPending}
            className="bg-amber/80 hover:bg-amber text-primary-foreground w-full shadow-lg shadow-amber/8 transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" strokeWidth={1.5} />
            {isExporting || exportMutation.isPending ? "Preparing archive..." : "Export everything"}
          </Button>
        </div>
      </div>

      {/* Account Deletion */}
      <div className="mb-10">
        <h2 className="font-serif-sacred text-sm text-destructive/70 mb-5 tracking-wide flex items-center gap-2.5">
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          Danger Zone
        </h2>
        <div className="glass border border-destructive/15 rounded-xl p-6">
          <p className="text-sm text-foreground/90 mb-2 font-medium">Delete your account</p>
          <p className="text-xs text-muted-foreground/50 mb-5 font-light leading-relaxed">
            This permanently deletes all your echoes, collections, and insights.
            This action cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="border-destructive/25 text-destructive/80 hover:bg-destructive/10 w-full transition-all duration-300"
            >
              Delete account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-destructive/70 font-light">
                Are you absolutely sure? All your data will be permanently lost.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border-border/40 text-muted-foreground hover:border-amber/20 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-destructive/80 hover:bg-destructive text-destructive-foreground shadow-lg shadow-destructive/8 transition-all duration-300"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Yes, delete everything"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        onClick={() => logout()}
        className="w-full border-border/30 text-muted-foreground/70 hover:border-amber/15 hover:text-foreground transition-all duration-300 mb-8"
      >
        Sign out
      </Button>
    </div>
  );
}
