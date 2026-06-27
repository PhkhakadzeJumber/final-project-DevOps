"use client";

import { useEffect, useState, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/todos`);
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();
      setTodos(data);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    if (editingId !== null) {
      editInputRef.current?.focus();
    }
  }, [editingId]);

  const addTodo = async () => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      const res = await fetch(`${API_URL}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, completed: false }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTodos((prev) => [...prev, created]);
      setNewTitle("");
    } catch {
      setError("Failed to add todo.");
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: todo.title, completed: !todo.completed }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch {
      setError("Failed to update todo.");
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const saveEdit = async (todo: Todo) => {
    const title = editingTitle.trim();
    if (!title || title === todo.title) {
      setEditingId(null);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, completed: todo.completed }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch {
      setError("Failed to update todo.");
    } finally {
      setEditingId(null);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Failed to delete todo.");
    }
  };

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">your tasks</p>
          <h1 className="text-4xl font-bold text-white">Todo List</h1>
          {todos.length > 0 && (
            <p className="mt-2 text-sm text-zinc-400">
              {remaining === 0
                ? "All done — great work!"
                : `${remaining} task${remaining !== 1 ? "s" : ""} left`}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-950 border border-red-800 text-red-300 text-sm">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-2 underline text-red-400 hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Add input */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={addTodo}
            disabled={!newTitle.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>

        {/* Todo list */}
        {loading ? (
          <div className="text-center text-zinc-500 text-sm py-12">Loading tasks...</div>
        ) : todos.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm py-12">
            No tasks yet. Add one above to get started.
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 group transition-colors hover:border-zinc-700"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTodo(todo)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    todo.completed
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-zinc-600 hover:border-indigo-500"
                  }`}
                >
                  {todo.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Title / Edit input */}
                {editingId === todo.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(todo);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => saveEdit(todo)}
                    className="flex-1 bg-zinc-800 border border-indigo-500 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none"
                  />
                ) : (
                  <span
                    onDoubleClick={() => !todo.completed && startEdit(todo)}
                    title={!todo.completed ? "Double-click to edit" : ""}
                    className={`flex-1 text-sm transition-colors ${
                      todo.completed
                        ? "line-through text-zinc-500"
                        : "text-zinc-100 cursor-pointer hover:text-indigo-300"
                    }`}
                  >
                    {todo.title}
                  </span>
                )}

                {/* Delete */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
                  aria-label="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        {todos.length > 0 && (
          <div className="mt-6 flex justify-between items-center text-xs text-zinc-600">
            <span>{todos.length} total task{todos.length !== 1 ? "s" : ""}</span>
            <span>{todos.filter((t) => t.completed).length} completed</span>
          </div>
        )}

        {/* Hint */}
        {todos.some((t) => !t.completed) && (
          <p className="mt-4 text-center text-xs text-zinc-700">
            Double-click a task title to edit it
          </p>
        )}

      </div>
    </main>
  );
}