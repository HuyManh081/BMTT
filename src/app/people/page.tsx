import { auth } from "@/auth";
import { PeopleAdmin } from "@/components/people-admin";
import { listUsers } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function PeoplePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "employee") redirect("/");

  return (
    <PeopleAdmin
      users={listUsers()}
      canManageRoles={session.user.role === "hr_admin"}
    />
  );
}