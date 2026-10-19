export const userRoles = ["employee", "manager", "hr_admin"] as const;

export type UserRole = (typeof userRoles)[number];

export type DirectoryUser = {
  email: string;
  name: string;
  role: UserRole;
};

type RoleState = { users: Map<string, DirectoryUser> };

const globalRoleState = globalThis as typeof globalThis & {
  nhipRoleState?: RoleState;
};

const state = (globalRoleState.nhipRoleState ??= { users: new Map() });

function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase("en-US");
}

function ensureBootstrapAdmin() {
  const configuredEmail = process.env.AUTH_HR_ADMIN_EMAIL;
  if (!configuredEmail) return;

  const email = normalizeEmail(configuredEmail);
  const current = state.users.get(email);
  state.users.set(email, {
    email,
    name: current?.name ?? email.split("@")[0],
    role: "hr_admin",
  });
}

export function registerUser(email: string, name: string) {
  ensureBootstrapAdmin();
  const normalizedEmail = normalizeEmail(email);
  const current = state.users.get(normalizedEmail);
  state.users.set(normalizedEmail, {
    email: normalizedEmail,
    name: name.trim() || normalizedEmail,
    role: current?.role ?? "employee",
  });
}

export function getUserRole(email: string): UserRole {
  ensureBootstrapAdmin();
  return state.users.get(normalizeEmail(email))?.role ?? "employee";
}

export function listUsers(): DirectoryUser[] {
  ensureBootstrapAdmin();
  return [...state.users.values()].sort((first, second) => first.name.localeCompare(second.name, "vi"));
}

export function changeUserRole(actorEmail: string, targetEmail: string, role: UserRole) {
  ensureBootstrapAdmin();
  if (getUserRole(actorEmail) !== "hr_admin") return "Bạn không có quyền thay đổi chức vụ.";
  if (!userRoles.includes(role)) return "Chức vụ không hợp lệ.";

  const normalizedTarget = normalizeEmail(targetEmail);
  const target = state.users.get(normalizedTarget);
  if (!target) return "Không tìm thấy nhân sự này.";

  const bootstrapEmail = process.env.AUTH_HR_ADMIN_EMAIL;
  if (bootstrapEmail && normalizedTarget === normalizeEmail(bootstrapEmail)) {
    return "Không thể thay đổi chức vụ của HR Admin khởi tạo.";
  }
  if (normalizedTarget === normalizeEmail(actorEmail) && role !== "hr_admin") {
    return "Không thể tự hạ chức vụ của mình.";
  }

  const updatedAdmins = listUsers().filter((user) => user.role === "hr_admin").length
    - (target.role === "hr_admin" ? 1 : 0)
    + (role === "hr_admin" ? 1 : 0);
  if (updatedAdmins < 1) return "Hệ thống phải luôn có ít nhất một HR Admin.";

  state.users.set(normalizedTarget, { ...target, role });
  return null;
}

export function roleLabel(role: UserRole) {
  return {
    employee: "Nhân viên",
    manager: "Quản lý",
    hr_admin: "HR Admin",
  }[role];
}