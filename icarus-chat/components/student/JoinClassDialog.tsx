import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JoinClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  joining: boolean;
  joinError: string | null;
  onJoin: () => void;
}

export function JoinClassDialog({
  open,
  onOpenChange,
  joinCode,
  setJoinCode,
  joining,
  joinError,
  onJoin,
}: JoinClassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a class</DialogTitle>
          <DialogDescription>
            Enter the class join code provided by your teacher to enroll.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            placeholder="Enter join code"
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
            disabled={joining}
          />
          {joinError ? <p className="text-sm text-destructive">{joinError}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={joining}>
            Cancel
          </Button>
          <Button onClick={onJoin} disabled={joining || !joinCode.trim()}>
            {joining ? "Joining..." : "Join"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
