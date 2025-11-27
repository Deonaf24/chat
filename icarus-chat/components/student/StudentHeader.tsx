import { Button } from "@/components/ui/button";
import { User } from "@/app/types/auth";

interface StudentHeaderProps {
  user: User | null;
  onOpenJoin: () => void;
}

export function StudentHeader({ user, onOpenJoin }: StudentHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Welcome back</p>
        <h1 className="text-4xl font-semibold leading-tight">
          {user ? `${user.username}'s classes` : "Your classes"}
        </h1>
        <p className="text-muted-foreground">Keep up with your courses and join new ones.</p>
      </div>
      <Button size="icon" className="rounded-full" onClick={onOpenJoin}>
        +
      </Button>
    </header>
  );
}
