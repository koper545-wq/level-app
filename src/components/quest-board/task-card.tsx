"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "@/types";
import { useAreaStore } from "@/stores/area-store";
import { useTaskStore } from "@/stores/task-store";

interface Props {
  task: Task;
  variant?: "focus" | "queue";
  onComplete: () => void;
}

export function TaskCard({ task, variant = "queue", onComplete }: Props) {
  const area = task.area || useAreaStore.getState().getAreaById(task.area_id || "");
  const postponeTask = useTaskStore((s) => s.postponeTask);
  const rescheduleTask = useTaskStore((s) => s.rescheduleTask);
  const addSubtask = useTaskStore((s) => s.addSubtask);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const deleteSubtask = useTaskStore((s) => s.deleteSubtask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const [confirming, setConfirming] = useState(false);
  const [showPostpone, setShowPostpone] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(task.notes || "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (confirming) {
      timerRef.current = setTimeout(() => setConfirming(false), 2500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [confirming]);

  useEffect(() => {
    if (editing) {
      setTimeout(() => editInputRef.current?.focus(), 50);
    }
  }, [editing]);

  function handleClick() {
    if (confirming) {
      setConfirming(false);
      onComplete();
    } else {
      setConfirming(true);
    }
  }

  function handlePostpone() {
    postponeTask(task.id);
    setShowPostpone(false);
  }

  function handleStartEdit() {
    setEditTitle(task.title);
    setEditing(true);
    setShowPostpone(false);
  }

  function handleSaveEdit() {
    if (!editTitle.trim()) return;
    if (editTitle.trim() !== task.title) {
      updateTask(task.id, { title: editTitle.trim() });
    }
    setEditing(false);
  }

  function handleDelete() {
    deleteTask(task.id);
    setConfirmDelete(false);
  }

  function handleSaveNotes() {
    const trimmed = notesValue.trim();
    updateTask(task.id, { notes: trimmed || null });
    setEditingNotes(false);
  }

  // Count subtasks progress
  const subtasksDone = task.subtasks?.filter((s) => s.is_done).length ?? 0;
  const subtasksTotal = task.subtasks?.length ?? 0;
  const hasNotes = !!task.notes;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.15 } }}
      className={`
        bg-surface border border-border rounded-card overflow-hidden
        ${variant === "focus" ? "ring-1 ring-accent/20" : ""}
      `}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Checkbox — two-tap to complete */}
        <button
          onClick={handleClick}
          className={`
            flex-shrink-0 w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center
            ${
              confirming
                ? "border-success bg-success/20 scale-110"
                : variant === "focus"
                ? "border-accent hover:border-accent hover:bg-accent/10 active:bg-accent/20"
                : "border-border hover:border-accent active:bg-accent/20"
            }
          `}
          aria-label={confirming ? "Potwierdz ukonczone" : "Ukoncz zadanie"}
        >
          {confirming && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-success"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <form
              onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={editInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
                className="flex-1 text-sm bg-transparent border-b border-accent focus:outline-none py-0.5"
              />
              <button type="submit" className="text-[10px] text-accent font-medium px-1.5">OK</button>
              <button type="button" onClick={() => setEditing(false)} className="text-[10px] text-foreground-secondary px-1">✕</button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                {task.recurrence_rule && !confirming && (
                  <span className="text-[10px] text-foreground-secondary" title="Powtarzajace">♻️</span>
                )}
                <p className={`text-sm truncate ${variant === "focus" ? "font-medium" : ""}`}>
                  {confirming ? (
                    <span className="text-success font-medium">Kliknij ponownie</span>
                  ) : (
                    task.title
                  )}
                </p>
              </div>
              {subtasksTotal > 0 && !confirming && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-12 h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${subtasksTotal > 0 ? (subtasksDone / subtasksTotal) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-foreground-secondary font-mono">{subtasksDone}/{subtasksTotal}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Area chip */}
        {area && !confirming && (
          <span
            className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: area.color }}
          >
            {area.name}
          </span>
        )}

        {/* Savings badge */}
        {!confirming && task.savings_amount > 0 && (
          <span className="flex-shrink-0 text-[10px] font-mono text-[#C49A1A] font-medium">
            {task.savings_amount} PLN
          </span>
        )}

        {/* XP badge */}
        {!confirming && (
          <span className="flex-shrink-0 text-xs font-mono text-foreground-secondary">
            +{task.xp_value}
          </span>
        )}

        {/* Postpone button */}
        {!confirming && (
          <button
            onClick={() => setShowPostpone(!showPostpone)}
            className="flex-shrink-0 p-1 text-foreground-secondary hover:text-foreground transition-colors"
            aria-label="Przesun zadanie"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Postpone options */}
      <AnimatePresence>
        {showPostpone && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {/* Reschedule row */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handlePostpone}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-foreground text-background min-h-[32px]"
                >
                  Jutro
                </button>
                <button
                  onClick={() => {
                    setTimeout(() => dateRef.current?.showPicker(), 50);
                  }}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-border text-foreground-secondary min-h-[32px]"
                >
                  Wybierz dzien
                </button>
                <button
                  onClick={() => {
                    rescheduleTask(task.id, null);
                    setShowPostpone(false);
                  }}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-border text-foreground-secondary min-h-[32px]"
                >
                  TBD
                </button>
                <input
                  ref={dateRef}
                  type="date"
                  min={today}
                  onChange={(e) => {
                    if (e.target.value) {
                      rescheduleTask(task.id, e.target.value);
                      setShowPostpone(false);
                    }
                  }}
                  className="sr-only"
                  tabIndex={-1}
                />
              </div>
              {/* Edit / Delete row */}
              <div className="flex gap-2 pt-1 border-t border-border/50">
                <button
                  onClick={handleStartEdit}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-border text-foreground-secondary hover:text-foreground transition-colors min-h-[32px] flex items-center gap-1"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                  Edytuj
                </button>
                {confirmDelete ? (
                  <>
                    <button
                      onClick={handleDelete}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-red-500 text-white min-h-[32px]"
                    >
                      Na pewno usun
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-border text-foreground-secondary min-h-[32px]"
                    >
                      Anuluj
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors min-h-[32px] flex items-center gap-1"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Usun
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtask expand toggle */}
      {!confirming && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-1.5 text-[10px] text-foreground-secondary hover:text-foreground border-t border-border transition-colors flex items-center justify-center gap-1"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {subtasksTotal > 0 ? `Podzadania (${subtasksDone}/${subtasksTotal})` : "Szczegoly"}
          {hasNotes && <span className="text-accent" title="Ma notatke">&#128221;</span>}
        </button>
      )}

      {/* Subtask list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1">
              {/* Scheduled date */}
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border/50">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-secondary flex-shrink-0">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-[10px] text-foreground-secondary uppercase tracking-wider font-medium">Data:</span>
                <input
                  type="date"
                  value={task.scheduled_date || ""}
                  onChange={(e) => {
                    rescheduleTask(task.id, e.target.value || null);
                  }}
                  className="text-xs bg-background border border-border rounded-lg px-2 py-1 focus:outline-none focus:border-accent"
                />
                {task.scheduled_date && (
                  <button
                    onClick={() => rescheduleTask(task.id, null)}
                    className="text-[10px] text-foreground-secondary hover:text-foreground px-1.5 py-0.5 rounded border border-border/50"
                  >
                    TBD
                  </button>
                )}
              </div>

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
                  if (!newSubtask.trim()) return;
                  addSubtask(task.id, newSubtask.trim());
                  setNewSubtask("");
                }}
                className="flex items-center gap-2 pt-1"
              >
                <span className="text-foreground-secondary text-xs">+</span>
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Dodaj podzadanie..."
                  className="flex-1 text-xs bg-transparent placeholder:text-foreground-secondary/50 focus:outline-none"
                />
              </form>

              {/* Notes / Links */}
              <div className="pt-2 mt-2 border-t border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium">Notatki / Linki</span>
                  {!editingNotes && (
                    <button
                      onClick={() => { setNotesValue(task.notes || ""); setEditingNotes(true); }}
                      className="text-[10px] text-accent"
                    >
                      {hasNotes ? "Edytuj" : "Dodaj"}
                    </button>
                  )}
                </div>
                {editingNotes ? (
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
                      <button onClick={handleSaveNotes} className="text-[10px] text-accent font-medium px-2 py-0.5 rounded bg-accent/10">Zapisz</button>
                      <button onClick={() => setEditingNotes(false)} className="text-[10px] text-foreground-secondary px-2 py-0.5">Anuluj</button>
                    </div>
                  </div>
                ) : hasNotes ? (
                  <div className="text-xs text-foreground-secondary whitespace-pre-wrap break-words">
                    {task.notes!.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
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
    </motion.div>
  );
}
