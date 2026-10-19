import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TaskBoard } from "@/components/task-board";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <TaskBoard userName={session.user.name ?? session.user.email ?? "Thành viên"} userRole={session.user.role} />;
}