import { apiClient } from "./client";
import { Announcement, Poll } from "@/app/types/school";

// We'll define types locally for create payloads if not in shared types
// Or assume they match the backend schemas

export async function createAnnouncement(classId: number, title: string, content: string): Promise<Announcement> {
    // TODO: use real author_id from token/context or let backend infer it
    const { data } = await apiClient.post<Announcement>(`/stream/announcements?author_id=1`, {
        class_id: classId, title, content
    });
    return data;
}

export async function getClassAnnouncements(classId: number): Promise<Announcement[]> {
    const { data } = await apiClient.get<Announcement[]>(`/stream/classes/${classId}/announcements`);
    return data;
}

export async function createPoll(classId: number, title: string, description: string, question: string, options: string[]): Promise<Poll> {
    const { data } = await apiClient.post<Poll>(`/stream/polls?author_id=1`, {
        class_id: classId, title, description, question, options
    });
    return data;
}

export async function getClassPolls(classId: number): Promise<Poll[]> {
    const { data } = await apiClient.get<Poll[]>(`/stream/classes/${classId}/polls`);
    return data;
}
