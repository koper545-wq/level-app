"use client";

import { useState, useMemo } from "react";
import { useAreaStore } from "@/stores/area-store";
import { useTaskStore } from "@/stores/task-store";
import { useGoalStore } from "@/stores/goal-store";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { QuickAdd } from "@/components/quest-board/quick-add";
import { handleTaskCompletion } from "@/lib/complete-task";

const AREA_COLORS = [
  "#3D4FE0", "#C4472A", "#5C7A3E", "#2E7D52", "#B8956A",
  "#C49A1A", "#404040", "#8B5CF6", "#EC4899", "#0EA5E9",
  "#F97316", "#14B8A6",
];

interface Props {
  areaId: string;
}

export function AreaDetail({ areaId }: Props) {
  const area = useAreaStore((s) => s.getAreaById(areaId));
  const updateArea = useAreaStore((s) => s.updateArea);
  const tasks = useTaskStore((s) => s.tasks);
  const goals = useGoalStore((s) => s.goals);
  const addSubtask = useTaskStore((s) => s.addSubtask);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const deleteSubtask = useTaskStore((s) => s.deleteSubtask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const [tab, setTab] = useState<"active" | "done">("active");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [confirmingTaskId, setConfirmingTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState<string | null>(null);
  const [editingNotesTaskId, setEditingNotesTaskId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.area_id === areaId && t.status === "pending"),
    [tasks, areaId]
  );

  const completedTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.area_id === areaId && t.status === "done")
        .sort(
          (a, b) =>
            new Date(b.completed_at || 0).getTime() -
            new Date(a.completed_at || 0).getTime()
        ),
    [tasks, areaId]
  );

  const areaGoals = useMemo(
    () => goals.filter((g) => g.area_id === areaId && g.status === "active"),
    [goals, areaId]
  );

  if (!area) {
    return (
      <div className="py-16 text-center text-foreground-secondary">
        Obszar nie znaleziony
      </div>
    );
  }

  function startEditing() {
    setEditName(area!.name);
    setEditColor(area!.color);
    setEditing(true);
  }

  function saveEditing() {
    if (!editName.trim()) return;
    updateArea(areaId, { name: editName.trim(), color: editColor });
    setEditing(false);
  }

  function handleTaskClick(taskId: string) {
    if (confirmingTaskId === taskId) {
      setConfirmingTaskId(null);
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        handleTaskCompletion(task);
      }
    } else {
      setConfirmingTaskId(taskId);
      setTimeout(() => setConfirmingTaskId((prev) => (prev === taskId ? null : prev)), 2500);
    }
  }

  return (
    <div>
      <Link
        href="/areas"
        className="inline-flex items-center gap-1 text-sm text-foreground-secondary hover:text-foreground transition-colors py-2"
      >
        &larr; Obszary
      </Link>

      {/* Area header */}
      {editing ? (
        <div className="mt-2 mb-6 p-4 bg-surface border border-border rounded-card space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium block mb-1">
              Nazwa
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-background border border-border rounded-card px-3 py-2 text-sm focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium block mb-2">
              Kolor
            </label>
            <div className="flex flex-wrap gap-2">
              {AREA_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEditColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    editColor === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveEditing}
              className="flex-1 text-xs bg-accent text-white py-2 rounded-card font-medium"
            >
              Zapisz
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 text-xs text-foreground-secondary border border-border py-2 rounded-card"
            >
              Anuluj
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-2 mb-6">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: area.color }}
          />
          <h2 className="text-2xl font-display">{area.name}</h2>
          <button
            onClick={startEditing}
            className="p-1.5 text-foreground-secondary hover:text-foreground transition-colors"
            aria-label="Edytuj obszar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
          <span className="text-xs text-foreground-secondary ml-auto font-mono">
            {pendingTasks.length} aktywne &middot; {completedTasks.length} skonczone
          </span>
        </div>
      )}

      {/* Quick add for this area */}
      <div className="mb-6 p-3 bg-surface border border-border rounded-card">
        <QuickAdd defaultAreaId={areaId} />
      </div>

      {/* Goals for this area */}
      {areaGoals.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-wider text-foreground-secondary mb-2 font-medium">
            Cele
          </p>
          <div className="space-y-2">
            {areaGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-3 bg-surface border border-border rounded-card"
              >
                <div className="flex items-center gap-2 mb-1">
                  {goal.is_boss && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                      BOSS
                    </span>
                  )}
                  <span className="text-sm font-medium">{goal.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${goal.progress_percent}%`,
                        backgroundColor: area.color,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-foreground-secondary">
                    {goal.progress_percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs: Active / Done */}
      <div className="flex gap-1 bg-surface border border-border rounded-card p-1 mb-4">
        <button
          onClick={() => setTab("active")}
          className={`flex-1 text-xs py-2 rounded-card transition-colors font-medium ${
            tab === "active"
              ? "bg-foreground text-background"
              : "text-foreground-secondary"
          }`}
        >
          Aktywne ({pendingTasks.length})
        </button>
        <button
          onClick={() => setTab("done")}
          className={`flex-1 text-xs py-2 rounded-card transition-colors font-medium ${
            tab === "done"
              ? "bg-foreground text-background"
              : "text-foreground-secondary"
          }`}
        >
          Skonczone ({completedTasks.length})
        </button>
      </div>

      {/* Task list */}
      <AnimatePresence mode="wait">
        {tab === "active" ? (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-foreground-secondary py-8 text-center">
                Brak aktywnych zadan
              </p>
            ) : (
              pendingTasks.map((task) => {
                const subtasksDone = task.subtasks?.filter((s) => s.is_done).length ?? 0;
                const subtasksTotal = task.subtasks?.length ?? 0;
                const isExpanded = expandedTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className="bg-surface border border-border rounded-card overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-3">
                      <button
                        onClick={() => handleTaskClick(task.id)}
                        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                          confirmingTaskId === task.id
                            ? "border-success bg-success/20 scale-110"
                            : "border-border hover:border-accent active:bg-accent/20"
                        }`}
                        aria-label={confirmingTaskId === task.id ? "Potwierdz" : "Ukoncz"}
                      >
                        {confirmingTaskId === task.id && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        {editingTaskId === task.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!editTaskTitle.trim()) return;
                              if (editTaskTitle.trim() !== task.title) {
                                updateTask(task.id, { title: editTaskTitle.trim() });
                              }
                              setEditingTaskId(null);
                            }}
                            className="flex items-center gap-1.5"
                          >
                            <input
                              type="text"
                              value={editTaskTitle}
                              onChange={(e) => setEditTaskTitle(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Escape") setEditingTaskId(null); }}
                              autoFocus
                              className="flex-1 text-sm bg-transparent border-b border-accent focus:outline-none py-0.5"
                            />
                            <button type="submit" className="text-[10px] text-accent font-medium px-1.5">OK</button>
                            <button type="button" onClick={() => setEditingTaskId(null)} className="text-[10px] text-foreground-secondary px-1">✕</button>
                          </form>
                        ) : confirmingTaskId === task.id ? (
                          <span className="text-sm text-success font-medium">Kliknij ponownie</span>
                        ) : (
                          <>
                            <span className="text-sm truncate block">{task.title}</span>
                            <div className="flex items-center gap-2">
                              {task.scheduled_date && (
                                <span className="text-[10px] text-foreground-secondary">
                                  {(() => {
                                    const today = new Date().toISOString().split("T")[0];
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    const tomorrowStr = tomorrow.toISOString().split("T")[0];
                                    if (task.scheduled_date === today) return "Dzisiaj";
                                    if (task.scheduled_date === tomorrowStr) return "Jutro";
                                    if (task.scheduled_date < today) return "Zalegly";
                                    const d = new Date(task.scheduled_date + "T00:00:00");
                                    return d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
                                  })()}
                                </span>
                              )}
                              {subtasksTotal > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="w-10 h-1 bg-border rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-accent rounded-full transition-all"
                                      style={{ width: `${subtasksTotal > 0 ? (subtasksDone / subtasksTotal) * 100 : 0}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-foreground-secondary font-mono">{subtasksDone}/{subtasksTotal}</span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {confirmingTaskId !== task.id && editingTaskId !== task.id && task.savings_amount > 0 && (
                        <span className="text-[10px] font-mono text-[#C49A1A] font-medium flex-shrink-0">
                          {task.savings_amount} PLN
                        </span>
                      )}
                      {confirmingTaskId !== task.id && editingTaskId !== task.id && (
                        <span className="text-xs font-mono text-foreground-secondary flex-shrink-0">
                          +{task.xp_value}
                        </span>
                      )}
                      {/* Edit & Delete buttons */}
                      {confirmingTaskId !== task.id && editingTaskId !== task.id && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditTaskTitle(task.title);
                              setEditingTaskId(task.id);
                            }}
                            className="p-1 text-foreground-secondary/40 hover:text-foreground transition-colors"
                            aria-label="Edytuj zadanie"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </button>
                          {confirmDeleteTaskId === task.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  deleteTask(task.id);
                                  setConfirmDeleteTaskId(null);
                                }}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white"
                              >
                                Usun
                              </button>
                              <button
                                onClick={() => setConfirmDeleteTaskId(null)}
                                className="text-[10px] text-foreground-secondary px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteTaskId(task.id)}
                              className="p-1 text-foreground-secondary/40 hover:text-red-500 transition-colors"
                              aria-label="Usun zadanie"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Subtask toggle */}
                    {confirmingTaskId !== task.id && (
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="w-full px-3 py-1.5 text-[10px] text-foreground-secondary hover:text-foreground border-t border-border transition-colors flex items-center justify-center gap-1"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                        {subtasksTotal > 0 ? `Podzadania (${subtasksDone}/${subtasksTotal})` : "Szczegoly"}
                        {task.notes && <span className="text-accent" title="Ma notatke">&#128221;</span>}
                      </button>
                    )}

                    {/* Subtask list */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-1">
                            {task.subtasks?.map((sub) => (
                              <div key={sub.id} className="flex items-center gap-2 group">
                                <button
                                  onClick={() => toggleSubtask(task.id, sub.id)}
                                  className={`flex-shrink-0 w-4 h-4 rounded border transition-all flex items-center justify-center ${
                                    sub.is_done
                                      ? "border-success bg-success text-white"
                                      : "border-border hover:border-accent"
                                  }`}
                                >
                                  {sub.is_done && (
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </button>
                                <span className={`text-xs flex-1 ${sub.is_done ? "line-through text-foreground-secondary" : ""}`}>
                                  {sub.title}
                                </span>
                                <button
                                  onClick={() => deleteSubtask(task.id, sub.id)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-foreground-secondary/30 hover:text-red-500 transition-all"
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!newSubtaskText.trim()) return;
                                addSubtask(task.id, newSubtaskText.trim());
                                setNewSubtaskText("");
                              }}
                              className="flex items-center gap-2 pt-1"
                            >
                              <span className="text-foreground-secondary text-xs">+</span>
                              <input
                                type="text"
                                value={newSubtaskText}
                                onChange={(e) => setNewSubtaskText(e.target.value)}
                                placeholder="Dodaj podzadanie..."
                                className="flex-1 text-xs bg-transparent placeholder:text-foreground-secondary/50 focus:outline-none"
                              />
                            </form>

                            {/* Notes / Links */}
                            <div className="pt-2 mt-2 border-t border-border/50">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium">Notatki / Linki</span>
                                {editingNotesTaskId !== task.id && (
                                  <button
                                    onClick={() => { setNotesValue(task.notes || ""); setEditingNotesTaskId(task.id); }}
                                    className="text-[10px] text-accent"
                                  >
                                    {task.notes ? "Edytuj" : "Dodaj"}
                                  </button>
                                )}
                              </div>
                              {editingNotesTaskId === task.id ? (
                                <div className="space-y-1.5">
                                  <textarea
                                    value={notesValue}
                                    onChange={(e) => setNotesValue(e.target.value)}
                                    placeholder="Wpisz notatke lub wklej link..."
                                    rows={3}
                                    autoFocus
                                    className="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-2 focus:outline-none focus:border-accent resize-none"
                                  />
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => {
                                        const trimmed = notesValue.trim();
                                        updateTask(task.id, { notes: trimmed || null });
                                        setEditingNotesTaskId(null);
                                      }}
                                      className="text-[10px] text-accent font-medium px-2 py-0.5 rounded bg-accent/10"
                                    >
                                      Zapisz
                                    </button>
                                    <button onClick={() => setEditingNotesTaskId(null)} className="text-[10px] text-foreground-secondary px-2 py-0.5">Anuluj</button>
                                  </div>
                                </div>
                              ) : task.notes ? (
                                <div className="text-xs text-foreground-secondary whitespace-pre-wrap break-words">
                                  {task.notes.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                                    /^https?:\/\//.test(part) ? (
                                      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-accent underline break-all">
                                        {part}
                                      </a>
                                    ) : (
                                      <span key={i}>{part}</span>
                                    )
                                  )}
                                </div>
                              ) : (
                                <p className="text-[10px] text-foreground-secondary/50 italic">Brak notatek</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {completedTasks.length === 0 ? (
              <p className="text-sm text-foreground-secondary py-8 text-center">
                Brak skonczonych zadan
              </p>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-surface border border-border rounded-card opacity-60 group"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-border flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm flex-1 truncate line-through">
                    {task.title}
                  </span>
                  {task.completed_at && (
                    <span className="text-[10px] text-foreground-secondary">
                      {new Date(task.completed_at).toLocaleDateString("pl-PL", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                  {confirmDeleteTaskId === task.id ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          deleteTask(task.id);
                          setConfirmDeleteTaskId(null);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white"
                      >
                        Usun
                      </button>
                      <button
                        onClick={() => setConfirmDeleteTaskId(null)}
                        className="text-[10px] text-foreground-secondary px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteTaskId(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-foreground-secondary/40 hover:text-red-500 transition-all flex-shrink-0"
                      aria-label="Usun zadanie"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
