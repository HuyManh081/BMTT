"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ArrowDown, ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays, Check, CheckCheck, ChevronDown, CircleHelp, Command, Filter, Inbox, LayoutGrid, LogOut, MoreHorizontal, Plus, Search, Settings2, Sparkles, Trash2, Users, X } from "lucide-react";
import type { UserRole } from "@/lib/roles";

type Priority = "Cao" | "Vừa" | "Thấp";
type Task = { id: string; title: string; project: string; due: string; priority: Priority; done: boolean; initials: string; person: string };
type View = "Tổng quan" | "Công việc" | "Lịch" | "Hộp thư" | "Thành viên";
type TaskDraft = Pick<Task, "title" | "project" | "due" | "priority">;

const projectColors = ["mint", "coral", "blue", "yellow", "rose"];
const seedProjects = ["Ứng dụng di động", "Website mùa thu", "Nghiên cứu Q4", "Design system", "Vận hành"];
const today = new Date();
const localDate = (offset: number) => {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const initialTasks: Task[] = [
  { id: "seed-1", title: "Hoàn thiện luồng onboarding", project: seedProjects[0], due: localDate(0), priority: "Cao", done: false, initials: "AL", person: "An Lê" },
  { id: "seed-2", title: "Chốt nội dung trang chủ", project: seedProjects[1], due: localDate(0), priority: "Vừa", done: false, initials: "MH", person: "Minh Hà" },
  { id: "seed-3", title: "Review bản thiết kế thanh toán", project: seedProjects[0], due: localDate(1), priority: "Cao", done: false, initials: "TN", person: "Thảo Nguyễn" },
  { id: "seed-4", title: "Phỏng vấn 5 người dùng mới", project: seedProjects[2], due: localDate(2), priority: "Vừa", done: false, initials: "QV", person: "Quân Võ" },
  { id: "seed-5", title: "Cập nhật thư viện component", project: seedProjects[3], due: localDate(4), priority: "Thấp", done: false, initials: "AL", person: "An Lê" },
  { id: "seed-6", title: "Gửi báo cáo sprint 08", project: seedProjects[4], due: localDate(-1), priority: "Thấp", done: true, initials: "MH", person: "Minh Hà" },
];

const filters = ["Tất cả", "Của tôi", "Đang mở", "Đã xong"] as const;
const views: View[] = ["Tổng quan", "Công việc", "Lịch", "Hộp thư", "Thành viên"];

function formatDate(value: string) {
  if (!value) return "Chưa đặt hạn";
  if (value === localDate(0)) return "Hôm nay";
  if (value === localDate(-1)) return "Hôm qua";
  return new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function projectColor(project: string) {
  const index = Math.max(0, seedProjects.indexOf(project));
  return projectColors[index % projectColors.length];
}

export function TaskBoard({ userName, userRole }: { userName: string; userRole: UserRole }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<(typeof filters)[number]>("Tất cả");
  const [view, setView] = useState<View>("Tổng quan");
  const [projectFilter, setProjectFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");
  const [sort, setSort] = useState("due");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [notice, setNotice] = useState("");
  const storageKey = `nhip.tasks.v1:${userName.toLocaleLowerCase("vi")}`;
  const projects = useMemo(() => [...new Set([...seedProjects, ...tasks.map((task) => task.project)])], [tasks]);
  const shown = useMemo(() => tasks.filter((task) => {
    const matchesFilter = filter === "Tất cả" || (filter === "Đã xong" ? task.done : filter === "Đang mở" ? !task.done : task.person === userName);
    const matchesQuery = `${task.title} ${task.project} ${task.person}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"));
    const matchesProject = !projectFilter || task.project === projectFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesView = view !== "Hộp thư" || (!task.done && (task.due === localDate(-1) || task.due === localDate(0)));
    return matchesFilter && matchesQuery && matchesProject && matchesPriority && matchesView;
  }).sort((first, second) => sort === "priority" ? ["Cao", "Vừa", "Thấp"].indexOf(first.priority) - ["Cao", "Vừa", "Thấp"].indexOf(second.priority) : sort === "title" ? first.title.localeCompare(second.title, "vi") : (first.due || "9999").localeCompare(second.due || "9999")), [tasks, filter, query, projectFilter, priorityFilter, view, sort, userName]);
  const doneCount = tasks.filter((task) => task.done).length;
  const openCount = tasks.length - doneCount;

  useEffect(() => {
    function handleKeys(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>("[data-task-search]")?.focus();
      }
      if (event.key === "Escape") {
        setDraft(null);
        setEditingId(null);
        setShowFilters(false);
      }
    }
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((task) => typeof task.id === "string" && typeof task.title === "string")) setTasks(parsed as Task[]);
      }
    } catch {
      setNotice("Không thể đọc dữ liệu đã lưu trên trình duyệt.");
    }
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch {
      setNotice("Không thể lưu dữ liệu. Hãy kiểm tra dung lượng trình duyệt.");
    }
  }, [loaded, storageKey, tasks]);

  function saveTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const project = String(form.get("project") ?? "").trim() || "Việc cá nhân";
    if (!title) return;
    const values: TaskDraft = { title, project, due: String(form.get("due") ?? ""), priority: (String(form.get("priority") ?? "Vừa") as Priority) };
    if (editingId) setTasks((current) => current.map((task) => task.id === editingId ? { ...task, ...values } : task));
    else setTasks((current) => [{ id: crypto.randomUUID(), ...values, done: false, initials: userName.slice(0, 2).toUpperCase(), person: userName }, ...current]);
    setDraft(null);
    setEditingId(null);
    setNotice(editingId ? "Đã cập nhật công việc." : "Đã thêm công việc.");
  }

  function editTask(task: Task) {
    setEditingId(task.id);
    setDraft({ title: task.title, project: task.project, due: task.due, priority: task.priority });
  }

  function toggleTask(id: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setNotice("Đã xóa công việc.");
  }

  return (
    <main className="workspace">
      <aside className="sidebar">
        <button className="side-brand" onClick={() => setView("Tổng quan")}><span className="brand-mark">n.</span><span>nhịp</span><ChevronDown size={15} /></button>
        <div className="team-switch"><span className="team-avatar">N</span><span className="team-name">Northstar Studio<small>Không gian nhóm</small></span></div>
        <button className="side-search" onClick={() => document.querySelector<HTMLInputElement>("[data-task-search]")?.focus()}><Search size={15} /><span>Tìm kiếm</span><kbd>⌘ K</kbd></button>
        <div className="side-label">KHÔNG GIAN</div>
        <nav className="side-nav">{views.map((item) => { const Icon = item === "Tổng quan" ? LayoutGrid : item === "Công việc" ? CheckCheck : item === "Hộp thư" ? Inbox : item === "Lịch" ? CalendarDays : Users; return <button key={item} className={view === item ? "nav-item active" : "nav-item"} onClick={() => setView(item)}><Icon size={17} /> {item}{item === "Công việc" && <span className="nav-count">{openCount}</span>}{item === "Hộp thư" && <span className="nav-count">{tasks.filter((task) => !task.done && task.due < localDate(0)).length}</span>}</button>; })}{userRole !== "employee" && <Link href="/people" className="nav-item"><BriefcaseBusiness size={17} /> Nhân sự</Link>}</nav>
        <div className="side-project-head"><span className="side-label">DỰ ÁN</span><button aria-label="Tạo công việc" onClick={() => { setEditingId(null); setDraft({ title: "", project: projectFilter, due: "", priority: "Vừa" }); }}><Plus size={15} /></button></div>
        <nav className="project-nav">{projects.map((project) => <button key={project} className={projectFilter === project ? "project-selected" : ""} onClick={() => { setProjectFilter(projectFilter === project ? "" : project); setView("Công việc"); }}><i className={`project-dot ${projectColor(project)}`} /> {project}</button>)}</nav>
        <div className="sidebar-bottom"><button className="profile-button" onClick={() => signOut({ redirectTo: "/login" })}><span className="profile-avatar">{userName.slice(0, 1).toUpperCase()}</span><span className="profile-info">{userName}<small>Đăng xuất</small></span><LogOut size={15} /></button></div>
      </aside>

      <section className="main-area">
        <header className="topbar"><div className="breadcrumb">Northstar Studio <span>/</span> <strong>Tổng quan</strong></div><div className="top-actions"><span className="today-label"><span className="live-dot" />Thứ Hai, 19 Tháng 10</span><button className="icon-button" aria-label="Thông báo"><Bell size={17} /><i /></button><span className="top-avatar">{userName.slice(0, 1).toUpperCase()}</span></div></header>
        <div className="page-content">
          <section className="greeting-row"><div><p className="eyebrow">{view.toLocaleUpperCase("vi")}</p><h1>Chào buổi sáng, {userName.split(" ")[0]} <span className="wave">✳</span></h1><p className="greeting-sub">{view === "Hộp thư" ? "Các việc đang mở đã đến hạn." : "Một tuần mới đang chờ mình. Đây là nhịp hôm nay."}</p></div><button className="primary-button" onClick={() => { setEditingId(null); setDraft({ title: "", project: projectFilter, due: "", priority: "Vừa" }); }}><Plus size={17} /> Tạo công việc</button></section>

          {view === "Tổng quan" && <section className="week-strip"><div className="week-intro"><span className="week-icon"><Sparkles size={17} /></span><span><strong>Tuần này của nhóm</strong><small>{tasks.length} việc trong không gian này</small></span></div><div className="week-stat"><span className="stat-number">{tasks.length}</span><span>công việc</span></div><div className="week-stat"><span className="stat-number">{doneCount}</span><span>đã hoàn thành</span></div><div className="progress-wrap"><div className="progress-label"><span>Tiến độ nhóm</span><strong>{tasks.length ? Math.round(doneCount / tasks.length * 100) : 0}%</strong></div><div className="progress-track"><div style={{ width: `${tasks.length ? doneCount / tasks.length * 100 : 0}%` }} /></div></div><button className="week-arrow" aria-label="Xem lịch" onClick={() => setView("Lịch")}><ArrowUpRight size={18} /></button></section>}

          {view === "Tổng quan" && <section className="focus-grid"><article className="focus-card focus-today"><div className="card-heading"><span className="heading-icon today-icon"><CalendarDays size={17} /></span><span><strong>Việc cần ưu tiên</strong><small>Đang mở, đến hạn hôm nay</small></span><span className="card-count">{tasks.filter((task) => !task.done && task.due === localDate(0)).length}</span></div><div className="priority-list">{tasks.filter((task) => !task.done && task.due === localDate(0)).slice(0, 3).map((task) => <div className="priority-row" key={task.id}><span className="priority-mark" /><span className="priority-title">{task.title}<small>{task.project}</small></span><span className="person-chip">{task.initials}</span></div>)}</div><button className="text-link" onClick={() => setView("Công việc")}>Xem tất cả công việc <ArrowUpRight size={14} /></button></article>
            <article className="focus-card focus-team"><div className="card-heading"><span className="heading-icon team-icon"><Users size={17} /></span><span><strong>Nhịp của nhóm</strong><small>Tiến độ theo thành viên</small></span></div>{[...new Set(tasks.map((task) => task.person))].slice(0, 3).map((person) => { const assigned = tasks.filter((task) => task.person === person); const completed = assigned.filter((task) => task.done).length; return <div className="team-progress-row" key={person}><div className="team-face face-one">{person.slice(0, 1)}</div><div className="team-progress-info"><span>{person}<small>{assigned.length} việc</small></span><div className="mini-track"><i style={{ width: `${assigned.length ? completed / assigned.length * 100 : 0}%` }} /></div></div><span className="team-percent">{completed}/{assigned.length}</span></div>; })}</article></section>}

          <section className="task-section" id="task-list"><div className="task-heading"><div><p className="eyebrow">{view === "Lịch" ? "SẮP THEO HẠN CHÓT" : view === "Hộp thư" ? "CẦN XỬ LÝ" : "CÙNG NHAU TIẾN LÊN"}</p><h2>{view === "Lịch" ? "Lịch công việc" : view === "Hộp thư" ? "Việc cần chú ý" : projectFilter || "Công việc của nhóm"}</h2></div><div className="task-tools"><label className="task-search"><Search size={15} /><input data-task-search aria-label="Tìm công việc" placeholder="Tìm công việc" value={query} onChange={(event) => setQuery(event.target.value)} /></label><button className="filter-button" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}><Filter size={15} /> Lọc <ArrowDown size={13} /></button><select className="sort-select" aria-label="Sắp xếp công việc" value={sort} onChange={(event) => setSort(event.target.value)}><option value="due">Hạn chót</option><option value="priority">Ưu tiên</option><option value="title">Tên việc</option></select></div></div>
            {showFilters && <div className="filter-panel"><label>Dự án<select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="">Tất cả dự án</option>{projects.map((project) => <option key={project}>{project}</option>)}</select></label><label>Ưu tiên<select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as Priority | "")}><option value="">Mọi mức</option><option>Cao</option><option>Vừa</option><option>Thấp</option></select></label><button className="text-link" onClick={() => { setProjectFilter(""); setPriorityFilter(""); setFilter("Tất cả"); }}>Xóa bộ lọc</button></div>}
            <div className="filter-tabs">{filters.map((item) => <button key={item} className={filter === item ? "filter-tab selected" : "filter-tab"} onClick={() => setFilter(item)}>{item}{item === "Đang mở" && <span>{openCount}</span>}</button>)}</div>
            {draft && <form className="add-task-form task-editor" onSubmit={saveTask}><input name="title" autoFocus required maxLength={120} placeholder="Tên công việc" defaultValue={draft.title} /><input name="project" list="project-options" placeholder="Dự án" defaultValue={draft.project} /><datalist id="project-options">{projects.map((project) => <option key={project} value={project} />)}</datalist><input name="due" type="date" aria-label="Hạn chót" defaultValue={draft.due} /><select name="priority" aria-label="Mức ưu tiên" defaultValue={draft.priority}><option>Cao</option><option>Vừa</option><option>Thấp</option></select><button type="submit" aria-label="Lưu công việc"><Check size={16} /></button><button type="button" aria-label="Hủy" onClick={() => { setDraft(null); setEditingId(null); }}><X size={16} /></button></form>}
            <div className="task-table"><div className="task-table-head"><span>CÔNG VIỆC</span><span>DỰ ÁN</span><span>HẠN CHÓT</span><span>ƯU TIÊN</span><span>NGƯỜI LÀM</span></div>{shown.map((task) => <div className={task.done ? "task-row is-done" : "task-row"} key={task.id}><button className={task.done ? "task-check checked" : "task-check"} aria-label={task.done ? "Đánh dấu chưa xong" : "Đánh dấu hoàn thành"} onClick={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))}>{task.done && <Check size={12} />}</button><span className="task-title-cell"><button className="task-title-button" onClick={() => editTask(task)}>{task.title}</button><button className="delete-task" aria-label={`Xóa ${task.title}`} onClick={() => deleteTask(task.id)}><Trash2 size={14} /></button></span><span className="project-cell"><i className={`project-dot ${projectColor(task.project)}`} />{task.project}</span><span className={task.due && task.due < localDate(0) && !task.done ? "due-cell overdue" : "due-cell"}><CalendarDays size={13} />{formatDate(task.due)}</span><span className={`priority-cell priority-${task.priority === "Cao" ? "high" : task.priority === "Vừa" ? "medium" : "low"}`}><i />{task.priority}</span><span className="assignee-cell"><i className={`assignee-avatar ${task.initials === "AL" ? "face-one" : task.initials === "MH" ? "face-two" : "face-three"}`}>{task.initials}</i>{task.person}</span></div>)}{shown.length === 0 && <div className="empty-state">Chưa có công việc phù hợp.</div>}</div>
            <button className="add-task-link" onClick={() => { setEditingId(null); setDraft({ title: "", project: projectFilter, due: "", priority: "Vừa" }); }}><Plus size={15} /> Thêm công việc</button>
          </section>
          <footer className="page-footer"><span><span className="footer-mark">n.</span> Dữ liệu lưu trên trình duyệt này.</span><span><Command size={13} /> + K để tìm nhanh</span></footer>
          {notice && <button className="notice" onClick={() => setNotice("")}>{notice} <X size={14} /></button>}
        </div>
      </section>
    </main>
  );
}