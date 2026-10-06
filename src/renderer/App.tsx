import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Preferences, Project, ProjectInput, SearchShortcut, Task, TaskInput, TaskPriority, TaskStatus, TrackerSummary } from "@shared/types";

type View = "overview" | "today";
type TaskDraft = Omit<TaskInput, "id">;
type ProjectDraft = Omit<ProjectInput, "id">;

const emptyTask: TaskDraft = {
  projectId: null,
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: null,
};
const emptyProject: ProjectDraft = { name: "", description: "", color: "#5b68d8" };

const statusLabel: Record<TaskStatus, string> = { todo: "To do", in_progress: "In progress", done: "Done" };
const priorityLabel: Record<TaskPriority, string> = { low: "Low", medium: "Medium", high: "High" };
const isMac = /mac/i.test(navigator.platform || navigator.userAgent);

function formatSearchShortcut(shortcut: SearchShortcut): string {
  const modifier = isMac ? "⌘" : "Ctrl";
  if (shortcut === "mod+shift+k") return `${modifier} + Shift + K`;
  return `${modifier} + ${shortcut === "mod+f" ? "F" : "K"}`;
}

function matchesSearchShortcut(event: KeyboardEvent, shortcut: SearchShortcut): boolean {
  const modifierPressed = isMac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
  const expectedKey = shortcut === "mod+f" ? "f" : "k";
  const expectsShift = shortcut === "mod+shift+k";
  return modifierPressed
    && !event.altKey
    && event.key.toLowerCase() === expectedKey
    && event.shiftKey === expectsShift;
}

function dateLabel(date: string | null): string {
  if (!date) return "No due date";
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<TrackerSummary>({ total: 0, completed: 0, inProgress: 0, overdue: 0, dueToday: 0 });
  const [view, setView] = useState<View>("overview");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [query, setQuery] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({ searchShortcut: "mod+k" });
  const [taskModal, setTaskModal] = useState<Task | null | "new">(null);
  const [projectModal, setProjectModal] = useState<Project | null | "new">(null);
  const [preferencesModal, setPreferencesModal] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const [nextTasks, nextProjects, nextSummary] = await Promise.all([
        window.tracker.listTasks(),
        window.tracker.listProjects(),
        window.tracker.getSummary(),
      ]);
      setTasks(nextTasks);
      setProjects(nextProjects);
      setSummary(nextSummary);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load your tracker.");
    }
  }

  useEffect(() => { void refresh(); }, []);
  useEffect(() => {
    void window.tracker.getPreferences()
      .then(setPreferences)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load preferences."));
  }, []);

  const visibleTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return tasks.filter((task) => {
      if (view === "today" && task.dueDate !== today) return false;
      if (projectFilter && task.projectId !== projectFilter) return false;
      if (statusFilter && task.status !== statusFilter) return false;
      if (priorityFilter && task.priority !== priorityFilter) return false;
      if (query && !`${task.title} ${task.description} ${task.projectName ?? ""}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [tasks, view, projectFilter, statusFilter, priorityFilter, query]);

  const activeProject = projects.find((project) => project.id === projectFilter);
  const heading = view === "today" ? "Due today" : activeProject?.name ?? "Your overview";
  const hasActiveFilters = Boolean(query || statusFilter || priorityFilter || projectFilter || view === "today");

  function clearFilters() {
    setQuery("");
    setStatusFilter("");
    setPriorityFilter("");
    setProjectFilter(null);
    setView("overview");
  }

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function onGlobalKey(event: KeyboardEvent) {
      if (!matchesSearchShortcut(event, preferences.searchShortcut)) return;
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName?.toLowerCase();
      const isEditable = active && (tag === "input" || tag === "textarea" || tag === "select" || active.isContentEditable);
      if (isEditable && active !== searchInputRef.current) return;
      if (searchInputRef.current) {
        event.preventDefault();
        searchInputRef.current.focus();
      }
    }
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [preferences.searchShortcut]);

  async function saveSearchShortcut(shortcut: SearchShortcut) {
    try {
      setPreferences(await window.tracker.saveSearchShortcut(shortcut));
      setPreferencesModal(false);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save preferences.");
    }
  }

  async function saveTask(input: TaskDraft, id?: string) {
    try {
      setTasks(await window.tracker.saveTask({ ...input, id }));
      setTaskModal(null);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this task.");
    }
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    try {
      setTasks(await window.tracker.deleteTask(task.id));
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete this task.");
    }
  }

  async function saveProject(input: ProjectDraft, id?: string) {
    try {
      await window.tracker.saveProject({ ...input, id });
      setProjectModal(null);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this project.");
    }
  }

  async function deleteProject(project: Project) {
    if (!window.confirm(`Delete “${project.name}”? Its tasks will stay in your inbox.`)) return;
    try {
      await window.tracker.deleteProject(project.id);
      setProjectFilter(null);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete this project.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">D</span><span>daymark</span></div>
        <div className="workspace-label">PERSONAL WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <button className={!projectFilter && view === "overview" ? "nav-item selected" : "nav-item"} onClick={() => { setView("overview"); setProjectFilter(null); }}>
            <span className="nav-icon">◫</span> Overview <span className="nav-count">{summary.total}</span>
          </button>
          <button className={view === "today" ? "nav-item selected" : "nav-item"} onClick={() => { setView("today"); setProjectFilter(null); }}>
            <span className="nav-icon">◷</span> Due today {summary.dueToday > 0 && <span className="nav-count">{summary.dueToday}</span>}
          </button>
        </nav>
        <div className="project-heading">
          <span>PROJECTS</span>
          <button className="icon-button add-project" aria-label="Add project" onClick={() => setProjectModal("new")}>＋</button>
        </div>
        <nav className="project-nav" aria-label="Projects">
          {projects.map((project) => (
            <button key={project.id} className={projectFilter === project.id ? "project-nav-item selected" : "project-nav-item"}
              onClick={() => { setView("overview"); setProjectFilter(project.id); }}>
              <span className="project-dot" style={{ background: project.color }} />
              <span className="project-name">{project.name}</span><span className="nav-count">{project.taskCount}</span>
            </button>
          ))}
          {projects.length === 0 && <p className="empty-sidebar">Your projects will show up here.</p>}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><span className="note-icon">✦</span><div><strong>A little progress</strong><p>Every task starts somewhere.</p></div></div>
          <div className="profile"><div className="avatar">Y</div><div><strong>Your workspace</strong><span>Just for you</span></div><button className="icon-button preferences-button" aria-label="Open preferences" title="Preferences" onClick={() => setPreferencesModal(true)}>⚙</button></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeProject?.name ?? (view === "today" ? "Today" : "Overview")}</strong></div>
          <div className="topbar-actions"><span className="local-badge"><span /> Saved on this device</span><button className="button button-primary" onClick={() => setTaskModal("new")}><span>＋</span> New task</button></div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">{view === "today" ? "YOUR DAY, AT A GLANCE" : activeProject ? "PROJECT" : "MONDAY IS A FRESH START"}</div>
              <div className="title-row"><h1>{heading}</h1>{activeProject && <button className="icon-button subtle" aria-label="Edit project" onClick={() => setProjectModal(activeProject)}>•••</button>}</div>
              <p className="subtitle">{view === "today" ? "A focused list of what’s on your plate today." : activeProject?.description || "Keep the important things moving, one task at a time."}</p>
            </div>
          </section>

          {!activeProject && view === "overview" && <section className="stats-grid" aria-label="Task summary">
            <StatCard label="Open tasks" value={summary.total - summary.completed} detail="Across all projects" icon="◫" tone="violet" />
            <StatCard label="In progress" value={summary.inProgress} detail="You’re making moves" icon="◴" tone="blue" />
            <StatCard label="Due today" value={summary.dueToday} detail={summary.dueToday ? "A good place to start" : "Nothing due today"} icon="◷" tone="amber" />
            <StatCard label="Overdue" value={summary.overdue} detail={summary.overdue ? "Ready for a quick review" : "You’re all caught up"} icon="↗" tone="rose" />
          </section>}

          <section className="tasks-section">
            <div className="section-title-row">
              <div><h2>{view === "today" ? "Today’s tasks" : activeProject ? "Project tasks" : "All tasks"}</h2><span className="task-total">{visibleTasks.length} {visibleTasks.length === 1 ? "task" : "tasks"}</span></div>
              {activeProject && <div className="project-actions"><button className="button button-secondary" onClick={() => setProjectModal(activeProject)}>Edit project</button><button className="button button-danger-quiet" onClick={() => void deleteProject(activeProject)}>Delete</button></div>}
            </div>
            <div className="filters">
              <label className="search-box"><span>⌕</span><input ref={searchInputRef} id="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." aria-label="Search tasks" /><kbd title={`Focus task search with ${formatSearchShortcut(preferences.searchShortcut)}`} aria-label={`Keyboard shortcut: ${formatSearchShortcut(preferences.searchShortcut)}`}>{formatSearchShortcut(preferences.searchShortcut)}</kbd></label>
              <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Any status</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option></select>
              <select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="">Any priority</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select>
              {!activeProject && <select aria-label="Filter by project" value={projectFilter ?? ""} onChange={(event) => setProjectFilter(event.target.value || null)}><option value="">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>}
              {hasActiveFilters && <button type="button" className="button button-secondary clear-filters" onClick={clearFilters}>Clear filters</button>}
            </div>
            {error && <div className="error-banner" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
            {visibleTasks.length > 0 ? <div className="task-list">
              {visibleTasks.map((task) => <TaskRow key={task.id} task={task} onEdit={() => setTaskModal(task)} onDelete={() => void deleteTask(task)} onStatus={(status) => void saveTask({
                projectId: task.projectId, title: task.title, description: task.description, status,
                priority: task.priority, dueDate: task.dueDate,
              }, task.id)} />)}
            </div> : <div className="empty-state"><div className="empty-illustration">✓</div><h3>{view === "today" ? "A little breathing room" : query || statusFilter || priorityFilter ? "No tasks match those filters" : "A clean slate"}</h3><p>{view === "today" ? "Nothing is due today. Enjoy the space, or pick up a task that’s already in motion." : query || statusFilter || priorityFilter ? "Try adjusting your search or filters." : "Add your first task and give it a place to land."}</p>{view !== "today" && !query && <button className="button button-primary" onClick={() => setTaskModal("new")}>＋ Add a task</button>}</div>}
          </section>
        </div>
      </main>

      {taskModal !== null && <TaskDialog task={taskModal === "new" ? null : taskModal} projects={projects} onClose={() => setTaskModal(null)} onSave={saveTask} />}
      {projectModal !== null && <ProjectDialog project={projectModal === "new" ? null : projectModal} onClose={() => setProjectModal(null)} onSave={saveProject} />}
      {preferencesModal && <PreferencesDialog preferences={preferences} onClose={() => setPreferencesModal(false)} onSave={saveSearchShortcut} />}
    </div>
  );
}

function StatCard({ label, value, detail, icon, tone }: { label: string; value: number; detail: string; icon: string; tone: string }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></article>;
}

function TaskRow({ task, onEdit, onDelete, onStatus }: { task: Task; onEdit: () => void; onDelete: () => void; onStatus: (status: TaskStatus) => void }) {
  const isOverdue = task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10) && task.status !== "done";
  return <article className={`task-row ${task.status === "done" ? "is-done" : ""}`}>
    <button className={`task-check ${task.status === "done" ? "checked" : ""}`} aria-label={task.status === "done" ? "Mark as to do" : "Mark as done"} onClick={() => onStatus(task.status === "done" ? "todo" : "done")}>{task.status === "done" ? "✓" : ""}</button>
    <button className="task-main" onClick={onEdit}><span className="task-title">{task.title}</span>{task.description && <span className="task-description">{task.description}</span>}</button>
    <div className="task-meta">
      {task.projectName && <span className="task-project"><span className="mini-dot" />{task.projectName}</span>}
      <span className={`priority-pill ${task.priority}`}><span />{priorityLabel[task.priority]}</span>
      <select className={`status-select ${task.status}`} aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => onStatus(event.target.value as TaskStatus)}>
        {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <span className={`due-date ${isOverdue ? "overdue" : ""}`}>{task.dueDate && <span>◷ </span>}{dateLabel(task.dueDate)}</span>
      <button className="row-menu" onClick={onDelete} aria-label={`Delete ${task.title}`}>×</button>
    </div>
  </article>;
}

function TaskDialog({ task, projects, onClose, onSave }: { task: Task | null; projects: Project[]; onClose: () => void; onSave: (input: TaskDraft, id?: string) => void }) {
  const [draft, setDraft] = useState<TaskDraft>(task ? {
    projectId: task.projectId, title: task.title, description: task.description,
    status: task.status, priority: task.priority, dueDate: task.dueDate,
  } : emptyTask);
  const set = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  function submit(event: FormEvent) { event.preventDefault(); onSave(draft, task?.id); }
  return <Modal title={task ? "Edit task" : "Create a task"} onClose={onClose}><form onSubmit={submit}>
    <label className="field"><span>Task name</span><input autoFocus required maxLength={200} placeholder="What needs to get done?" value={draft.title} onChange={(event) => set("title", event.target.value)} /></label>
    <label className="field"><span>Description <small>Optional</small></span><textarea rows={3} maxLength={10_000} placeholder="Add a little more context..." value={draft.description} onChange={(event) => set("description", event.target.value)} /></label>
    <div className="form-grid">
      <label className="field"><span>Project</span><select value={draft.projectId ?? ""} onChange={(event) => set("projectId", event.target.value || null)}><option value="">No project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
      <label className="field"><span>Due date</span><input type="date" value={draft.dueDate ?? ""} onChange={(event) => set("dueDate", event.target.value || null)} /></label>
      <label className="field"><span>Status</span><select value={draft.status} onChange={(event) => set("status", event.target.value as TaskStatus)}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="field"><span>Priority</span><select value={draft.priority} onChange={(event) => set("priority", event.target.value as TaskPriority)}>{Object.entries(priorityLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">{task ? "Save changes" : "Create task"}</button></div>
  </form></Modal>;
}

function ProjectDialog({ project, onClose, onSave }: { project: Project | null; onClose: () => void; onSave: (input: ProjectDraft, id?: string) => void }) {
  const [draft, setDraft] = useState<ProjectDraft>(project ? { name: project.name, description: project.description, color: project.color } : emptyProject);
  function submit(event: FormEvent) { event.preventDefault(); onSave(draft, project?.id); }
  return <Modal title={project ? "Edit project" : "Create a project"} onClose={onClose}><form onSubmit={submit}>
    <label className="field"><span>Project name</span><input autoFocus required maxLength={100} placeholder="e.g. Home refresh" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
    <label className="field"><span>Description <small>Optional</small></span><textarea rows={3} maxLength={2_000} placeholder="What is this project about?" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
    <label className="field color-field"><span>Project color</span><input type="color" value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} /><span className="color-hint">A little color makes it easier to spot.</span></label>
    <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">{project ? "Save changes" : "Create project"}</button></div>
  </form></Modal>;
}

function PreferencesDialog({ preferences, onClose, onSave }: { preferences: Preferences; onClose: () => void; onSave: (shortcut: SearchShortcut) => void }) {
  const [shortcut, setShortcut] = useState<SearchShortcut>(preferences.searchShortcut);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSave(shortcut);
  }

  return <Modal title="Preferences" onClose={onClose}><form onSubmit={submit}>
    <label className="field">
      <span>Search shortcut</span>
      <select value={shortcut} onChange={(event) => setShortcut(event.target.value as SearchShortcut)}>
        <option value="mod+k">{isMac ? "⌘ + K" : "Ctrl + K"}</option>
        <option value="mod+shift+k">{isMac ? "⌘ + Shift + K" : "Ctrl + Shift + K"}</option>
        <option value="mod+f">{isMac ? "⌘ + F" : "Ctrl + F"}</option>
      </select>
      <small className="field-help">Focus task search from anywhere outside another editable field.</small>
    </label>
    <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">Save preferences</button></div>
  </form></Modal>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading"><div><div className="eyebrow">DAYMARK</div><h2 id="modal-title">{title}</h2></div><button className="icon-button" aria-label="Close" onClick={onClose}>×</button></div>
      {children}
    </section>
  </div>;
}

export { App };
