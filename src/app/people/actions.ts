"use server";

import { auth } from "@/auth";
import { changeUserRole, userRoles, type UserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";

export type RoleActionState = { ok: boolean; message: string } | null;

export async function updateUserRoleAction(
  _previousState: RoleActionState,
  formData: FormData,
): Promise<RoleActionState> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "hr_admin") {
    return { ok: false, message: "Bạn không có quyền thay đổi chức vụ." };
  }

  const email = String(formData.get("email") ?? "");
  const roleValue = String(formData.get("role") ?? "");
  if (!userRoles.includes(roleValue as UserRole)) {
    return { ok: false, message: "Chức vụ không hợp lệ." };
  }

  const error = changeUserRole(session.user.email, email, roleValue as UserRole);
  if (error) return { ok: false, message: error };

  revalidatePath("/people");
  return { ok: true, message: "Đã cập nhật chức vụ." };
}