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
    class_ids: number[];
}

export interface ClassBase {
    name: string;
    description?: string | null;
    teacher_id?: number | null;
    join_code: string;
}

export interface ClassCreate extends ClassBase {
    // Currently empty
}

export interface ClassRead extends ClassBase, TimestampModel {
    id: number;
    join_code: string;
    student_ids: number[];
    assignment_ids: number[];
}

export interface AssignmentBase {
    title: string;
    description?: string | null;
    due_at?: Date | null; // Optional[datetime] maps to Date | null | undefined
    class_id: number;
    teacher_id?: number | null;
}

export interface AssignmentCreate extends AssignmentBase {
    // Currently empty
}

export interface AssignmentRead extends AssignmentBase, TimestampModel {
    id: number;
    file_ids: number[];
}

export interface FileBase {
    filename: string;
    path: string;
    assignment_id: number;
}

export interface FileCreate extends FileBase {
    // Currently empty
}

export interface FileRead extends FileBase, TimestampModel {
    id: number;
}

