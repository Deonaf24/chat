import { Announcement, Poll } from "@/app/types/school";
// We'll define types locally for create payloads if not in shared types
// Or assume they match the backend schemas

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function createAnnouncement(classId: number, title: string, content: string, token: string): Promise<Announcement> {
    const res = await fetch(`${API_URL}/stream/announcements?author_id=1`, { // TODO: use real author_id from token/context
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ class_id: classId, title, content })
    });

    if (!res.ok) throw new Error("Failed to create announcement");
    return res.json();
}

export async function getClassAnnouncements(classId: number, token: string): Promise<Announcement[]> {
    const res = await fetch(`${API_URL}/stream/classes/${classId}/announcements`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Failed to fetch announcements");
    return res.json();
}

export async function createPoll(classId: number, title: string, description: string, question: string, options: string[], token: string): Promise<Poll> {
    const res = await fetch(`${API_URL}/stream/polls?author_id=1`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ class_id: classId, title, description, question, options })
    });

    if (!res.ok) throw new Error("Failed to create poll");
    return res.json();
}

export async function getClassPolls(classId: number, token: string): Promise<Poll[]> {
    const res = await fetch(`${API_URL}/stream/classes/${classId}/polls`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Failed to fetch polls");
    return res.json();
}
