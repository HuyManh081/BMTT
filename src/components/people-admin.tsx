"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, BriefcaseBusiness, ShieldCheck, UsersRound } from "lucide-react";
import { updateUserRoleAction } from "@/app/people/actions";
import type { RoleActionState } from "@/app/people/actions";
import { roleLabel, userRoles, type DirectoryUser } from "@/lib/roles";
import styles from "./people-admin.module.css";

export function PeopleAdmin({
  users,
  canManageRoles,
}: {
  users: DirectoryUser[];
  canManageRoles: boolean;
}) {
  const [state, formAction, pending] = useActionState<RoleActionState, FormData>(
    updateUserRoleAction,
    null,
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} href="/">
          <ArrowLeft size={16} /> Không gian làm việc
        </Link>
        <div className={styles.titleRow}>
          <span className={styles.icon}><UsersRound size={21} /></span>
          <div>
            <p className={styles.eyebrow}>NHÂN SỰ</p>
            <h1>Thành viên trong nhóm</h1>
          </div>
        </div>
        <p className={styles.description}>
          {canManageRoles
            ? "Xem danh sách và cập nhật chức vụ của từng thành viên."
            : "Danh sách thành viên và chức vụ trong nhóm."}
        </p>
      </header>

      <section className={styles.section} aria-labelledby="people-heading">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="people-heading">Danh sách nhân sự</h2>
            <p>{users.length} thành viên đã đăng nhập</p>
          </div>
          {canManageRoles && <span className={styles.adminBadge}><ShieldCheck size={14} /> HR Admin</span>}
        </div>

        {state && (
          <p className={state.ok ? styles.success : styles.error} role="status">
            {state.message}
          </p>
        )}

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr><th>Thành viên</th><th>Email</th><th>Chức vụ</th>{canManageRoles && <th aria-label="Thao tác" />}</tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  <td><span className={styles.person}><span className={styles.avatar}>{user.name.slice(0, 1).toUpperCase()}</span>{user.name}</span></td>
                  <td className={styles.email}>{user.email}</td>
                  <td>
                    {canManageRoles ? (
                      <form action={formAction} className={styles.roleForm}>
                        <input type="hidden" name="email" value={user.email} />
                        <select name="role" defaultValue={user.role} aria-label={`Chức vụ của ${user.name}`} disabled={pending}>
                          {userRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                        </select>
                        <button type="submit" disabled={pending}>
                          <BriefcaseBusiness size={14} /> Lưu
                        </button>
                      </form>
                    ) : (
                      <span className={styles.roleLabel}>{roleLabel(user.role)}</span>
                    )}
                  </td>
                  {canManageRoles && <td />}
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={canManageRoles ? 4 : 3} className={styles.empty}>Chưa có thành viên nào.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <p className={styles.note}>Chức vụ đang được lưu tạm thời trong bộ nhớ máy chủ.</p>
    </main>
  );
}