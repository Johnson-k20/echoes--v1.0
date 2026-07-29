import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { Shield, Download, Trash2, Lock, Key, FileArchive } from "lucide-react";
import { toast } from "sonner";

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
      // Trigger download
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
      <h1 className="font-serif-display text-2xl text-foreground mb-8">Settings</h1>

      {/* User info */}
      <div className="mb-8 p-4 bg-charcoal-light border border-border/30 rounded-xl">
        <p className="text-sm text-foreground">{user?.name || "Anonymous"}</p>
        <p className="text-xs text-muted-foreground mt-1">{user?.email || ""}</p>
      </div>

      {/* Privacy & Encryption */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber/60" />
          Privacy & Encryption
        </h2>
        <div className="bg-charcoal-light border border-border/30 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Key className="h-4 w-4 text-amber/60 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground">Client-side encryption</p>
              <p className="text-xs text-muted-foreground mt-1">
                Future Self letters are encrypted in your browser before upload. 
                The server never has access to the plaintext audio before the unlock date. 
                Your voice is protected end-to-end.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="h-4 w-4 text-amber/60 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground">True time-lock</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sealed letters are cryptographically enforced on the server. 
                No one — not you, not an admin — can open a letter before its unlock date. 
                The lock is real, not decorative.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-4 w-4 text-amber/60 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground">No third-party access</p>
              <p className="text-xs text-muted-foreground mt-1">
                No analytics SDKs touch your voice data. 
                No ads. No tracking of your content. 
                Your echoes belong only to you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Archive Export */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <FileArchive className="h-4 w-4 text-amber/60" />
          Your Archive
        </h2>
        <div className="bg-charcoal-light border border-border/30 rounded-xl p-5">
          <p className="text-sm text-foreground mb-2">Export your entire vault</p>
          <p className="text-xs text-muted-foreground mb-4">
            Download a complete archive of all your echoes — audio files, transcripts, 
            and metadata — in a portable ZIP format. Your memories, always yours.
          </p>
          <Button
            onClick={handleExport}
            disabled={isExporting || exportMutation.isPending}
            className="bg-amber/90 hover:bg-amber text-primary-foreground w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting || exportMutation.isPending ? "Preparing archive..." : "Export everything"}
          </Button>
        </div>
      </div>

      {/* Account Deletion */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-destructive mb-4 flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Danger Zone
        </h2>
        <div className="bg-charcoal-light border border-destructive/20 rounded-xl p-5">
          <p className="text-sm text-foreground mb-2">Delete your account</p>
          <p className="text-xs text-muted-foreground mb-4">
            This permanently deletes all your echoes, collections, and insights. 
            This action cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 w-full"
            >
              Delete account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-destructive">
                Are you absolutely sure? All your data will be permanently lost.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border-border text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-destructive hover:bg-destructive/80 text-destructive-foreground"
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
        className="w-full border-border text-muted-foreground mb-8"
      >
        Sign out
      </Button>
    </div>
  );
}
