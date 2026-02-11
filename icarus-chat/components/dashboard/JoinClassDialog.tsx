"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { joinClassByCode } from "@/app/lib/api/school";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";

interface JoinClassDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJoinSuccess: () => void;
}

export function JoinClassDialog({ open, onOpenChange, onJoinSuccess }: JoinClassDialogProps) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const { student } = useDashboardAuth();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase();
        // Only allow alphanumeric characters
        value = value.replace(/[^A-Z0-9]/g, "");
        // Limit to 6 characters
        if (value.length <= 6) {
            setCode(value);
        }
    };

    const handleJoin = async () => {
        if (code.length !== 6 || !student) return;

        setLoading(true);
        try {
            await joinClassByCode(code, student.id);

            toast.success("Successfully joined class!");
            setCode("");
            onJoinSuccess();
            onOpenChange(false);
        } catch (error) {
            // @ts-ignore
            const message = error?.response?.data?.detail || "Failed to join class. Please check the code.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Join a Class</DialogTitle>
                    <DialogDescription>
                        Enter the 6-character code provided by your teacher.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="join-code">Class Code</Label>
                        <Input
                            id="join-code"
                            placeholder="ABC123"
                            value={code}
                            onChange={handleInputChange}
                            className="text-center text-2xl tracking-widest uppercase font-mono h-14"
                            maxLength={6}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleJoin} disabled={code.length !== 6 || loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Join Class
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
