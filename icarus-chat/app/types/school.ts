export interface TimestampModel {
    created_at: Date;
    updated_at: Date;
}

export interface TeacherBase {
    // Currently empty, specific teacher fields would go here.
}

export interface TeacherCreate extends TeacherBase {
    user_id: number;
}

export interface TeacherRead extends TeacherBase, TimestampModel {
    id: number;
    user_id: number;
    name?: string;
    email?: string;
    profile_picture_url?: string;
    class_ids: number[]; // List[int] maps to number[]
    assignment_ids: number[];
}

export interface StudentBase {
    // Currently empty, specific student fields would go here.
}

export interface StudentCreate extends StudentBase {
    user_id: number;
}

export interface StudentRead extends StudentBase, TimestampModel {
    id: number;
    user_id: number;
    name?: string;
    email?: string;
    profile_picture_url?: string;
    class_ids: number[];
}

export interface ClassBase {
    name: string;
    description?: string | null;
    teacher_id?: number | null;
    join_code: string;
}

export interface LectureBase {
    day_of_week: number;
    start_time: string; // HH:MM
    duration_minutes: number;
}

export interface LectureCreate extends LectureBase { }

export interface LectureRead extends LectureBase {
    id: number;
    class_id: number;
}

export interface ClassCreate extends ClassBase {
    start_date?: string;
    end_date?: string;
    lectures?: LectureCreate[];
}

export interface ClassRead extends ClassBase, TimestampModel {
    id: number;
    join_code: string;
    student_ids: number[];
    assignment_ids: number[];
    start_date?: string;
    end_date?: string;
    lectures?: LectureRead[];
    google_id?: string | null;
    is_google_synced?: boolean;
}

export type Class = ClassRead;

export interface AssignmentBase {
    title: string;
    description?: string | null;
    due_at?: Date | null; // Optional[datetime] maps to Date | null | undefined
    class_id: number;
    teacher_id?: number | null;
    level: number;
}

export interface AssignmentCreate extends AssignmentBase {
    // Currently empty
}

export interface StudentAssignmentInfo {
    student_id: number;
    status: string | null;
    grade: number | null;
    google_submission_id: string | null;
}

export interface AssignmentRead extends AssignmentBase, TimestampModel {
    id: number;
    file_ids: number[];
    google_id?: string | null;
    google_link?: string | null;
    submission?: StudentAssignmentInfo | null;
    all_submissions?: StudentAssignmentInfo[];
    concepts?: Concept[];
    difficulty?: string;
}

export interface FileBase {
    filename: string;
    path: string;
    url?: string | null;
    mime_type?: string | null;
    size?: number;
    assignment_id?: number | null;
    material_id?: number | null;
}

export interface FileCreate extends FileBase {
    // Currently empty
}

export interface FileRead extends FileBase, TimestampModel {
    id: number;
}

export interface ChapterRead {
    id: number;
    title: string;
    description?: string | null;
    class_id: number;
    order: number;
    created_at: string;
    updated_at: string;
    concept_ids: number[];
    assignment_ids: number[];
    material_ids: number[];
}

export interface Material {
    id: number;
    title: string;
    description?: string | null;
    class_id: number;
    teacher_id: number;
    created_at: string;
    updated_at: string;
    file_ids: number[];
    concept_ids: number[];
}

export interface FileRead extends FileBase, TimestampModel {
    id: number;
}


export interface Announcement {
    id: number;
    title: string;
    content: string;
    class_id: number;
    author_id: number;
    created_at: string;
    updated_at: string;
}

export interface PollOption {
    id: number;
    poll_id: number;
    text: string;
    vote_count: number;
}

export interface Poll {
    id: number;
    title: string;
    description?: string;
    question: string;
    class_id: number;
    author_id: number;
    created_at: string;
    updated_at: string;
    options: PollOption[];
    user_voted_option_id?: number | null;
}

export interface Concept {
    id: number;
    name: string;
    description?: string | null;
}
