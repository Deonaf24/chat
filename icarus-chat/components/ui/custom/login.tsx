import { authStore } from "@/app/lib/auth/authStore"
import { useState } from "react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IMaskMixin } from 'react-imask'

export function LogInPopUp() {

    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loggedIn, setLoggedIn] = useState<boolean>(false);

    const handleLogIn = async () => {
        const response = await authStore.login(username, password);
        console.log("logged in as", username);
        setOpen(false);
        setLoggedIn(true);
        return response.username
    }

    const handleLogOut = async () => {
        const response = await authStore.logout();
        console.log("logged out");
        setLoggedIn(false);
        return;
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        {!loggedIn ? (
            // Show when NOT logged in
            <DialogTrigger asChild>
                <Button variant="outline">Log In</Button>
            </DialogTrigger>
            ) : (
            // Show when logged in
            <Button variant="outline" type="submit" onClick={handleLogOut}>
                Log Out
            </Button>
        )}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log In</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input 
                id="username-1" 
                name="username" 
                placeholder="username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label 
              htmlFor="password-1">Password</Label>
              <Input 
                id="password-1" 
                name="password" 
                type="password"
                placeholder="password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleLogIn}>Log In</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
