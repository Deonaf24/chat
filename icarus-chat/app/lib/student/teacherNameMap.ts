import { TeacherRead } from "@/app/types/school";
import { User } from "@/app/types/auth";

export function mapTeachersToUsernames(
  teachers: TeacherRead[],
  usersById: Record<number, User>,
): Record<number, string> {
  return teachers.reduce<Record<number, string>>((accumulator, teacher) => {
    const username = usersById[teacher.user_id]?.username ?? "Teacher";
    return { ...accumulator, [teacher.id]: username };
  }, {});
}
