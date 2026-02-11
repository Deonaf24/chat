import { apiClient } from "./client";

export interface CalendarEvent {
    id: number;
    student_id: number;
    class_id: number | null;
    title: string;
    description: string | null;
    start_at: string;
    end_at: string;
    google_event_id: string | null;
    source: string | null;
    created_at: string;
    updated_at: string;
}

export interface CalendarEventCreate {
    title: string;
    description?: string | null;
    start_at: string;
    end_at: string;
    class_id?: number | null;
    source?: string | null;
}

export interface CalendarEventBulkCreate {
    events: CalendarEventCreate[];
}

/**
 * Create multiple calendar events for a student
 */
export async function createCalendarEvents(
    studentId: number,
    events: CalendarEventCreate[]
): Promise<CalendarEvent[]> {
    const response = await apiClient.post<CalendarEvent[]>(
        `/students/${studentId}/calendar-events/`,
        { events }
    );
    return response.data;
}

/**
 * List calendar events for a student
 */
export async function listCalendarEvents(
    studentId: number,
    startDate?: string,
    endDate?: string
): Promise<CalendarEvent[]> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await apiClient.get<CalendarEvent[]>(
        `/students/${studentId}/calendar-events/`,
        { params }
    );
    return response.data;
}

/**
 * List calendar events for a teacher
 */
export async function listTeacherCalendarEvents(
    teacherId: number,
    startDate?: string,
    endDate?: string
): Promise<CalendarEvent[]> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await apiClient.get<CalendarEvent[]>(
        `/teachers/${teacherId}/calendar-events/`,
        { params }
    );
    return response.data;
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
    studentId: number,
    eventId: number
): Promise<void> {
    await apiClient.delete(`/students/${studentId}/calendar-events/${eventId}`);
}
