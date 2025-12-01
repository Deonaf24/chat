import { User } from "@/app/types/auth";
import { ClassRead, TeacherRead } from "@/app/types/school";

export function mapTeacherName(
  classData: ClassRead | null,
  teachers: TeacherRead[],
  usersById: Record<number, User>,
) {
  if (!classData?.teacher_id) return null;

  const teacherRecord = teachers.find((entry) => entry.id === classData.teacher_id);
  return teacherRecord ? usersById[teacherRecord.user_id]?.username ?? null : null;
}
