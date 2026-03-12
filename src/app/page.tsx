'use client';

import { useState, useEffect, useCallback } from 'react';
import { TodoItem, FilterType, CreateTodoRequest, UpdateTodoRequest } from '@/types/todo';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

interface EditModalProps {
  todo: TodoItem;
  onSave: (id: string, data: UpdateTodoRequest) => Promise<void>;
  onClose: () => void;
}

function EditModal({ todo, onSave, onClose }: EditModalProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(todo.id, {
        title: title.trim(),
        description: description.trim() || null
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Todo</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Todo title"
                maxLength={255}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmProps {
  todo: TodoItem;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

function DeleteConfirm({ todo, onConfirm, onClose }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Delete Todo</h2>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold text-gray-800">&ldquo;{todo.title}&rdquo;</span>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TodoCardProps {
  todo: TodoItem;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onEdit: (todo: TodoItem) => void;
  onDelete: (todo: TodoItem) => void;
}

function TodoCard({ todo, onToggle, onEdit, onDelete }: TodoCardProps) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(todo.id, !todo.completed);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
      todo.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          disabled={toggling}
          className="mt-0.5 flex-shrink-0"
          aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            todo.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-blue-400'
          } ${toggling ? 'opacity-50' : ''}`}>
            {todo.completed && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-800 break-words ${
            todo.completed ? 'line-through text-gray-400' : ''
          }`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className={`text-sm mt-1 break-words ${
              todo.completed ? 'text-gray-400 line-through' : 'text-gray-600'
            }`}>
              {todo.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {formatDate(todo.createdAt)}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(todo)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit todo"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete todo"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<TodoItem | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setError('');
      const res = await fetch('/api/todos');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch todos');
      }
      setTodos(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError('Title is required');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      const payload: CreateTodoRequest = {
        title: newTitle.trim(),
        description: newDescription.trim() || undefined
      };
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create todo');
      }
      setTodos((prev) => [json.data, ...prev]);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update todo');
      }
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? json.data : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const handleSaveEdit = async (id: string, data: UpdateTodoRequest) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update todo');
    }
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? json.data : t))
    );
  };

  const handleDelete = async () => {
    if (!deletingTodo) return;
    const res = await fetch(`/api/todos/${deletingTodo.id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to delete todo');
    }
    setTodos((prev) => prev.filter((t) => t.id !== deletingTodo.id));
    setDeletingTodo(null);
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ✅ Todo App
          </h1>
          <p className="text-gray-500">Stay organized and get things done</p>
        </div>

        {/* Add Todo Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Todo</h2>
          {createError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {createError}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (createError) setCreateError('');
                }}
                placeholder="What needs to be done? *"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                maxLength={255}
                disabled={creating}
              />
            </div>
            <div>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add a description (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-none"
                rows={2}
                disabled={creating}
              />
            </div>
            <button
              type="submit"
              disabled={creating || !newTitle.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Todo
                </>
              )}
            </button>
          </form>
        </div>

        {/* Stats & Filters */}
        {todos.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-500 font-medium">
                <span className="text-blue-600 font-bold">{completedCount}</span> of{' '}
                <span className="font-bold text-gray-700">{totalCount}</span> todos completed
              </p>
              <div className="flex gap-1">
                {filters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === f.value
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {f.label}
                    {f.value === 'all' && (
                      <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                        filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {totalCount}
                      </span>
                    )}
                    {f.value === 'active' && (
                      <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                        filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {totalCount - completedCount}
                      </span>
                    )}
                    {f.value === 'completed' && (
                      <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                        filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {completedCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Todo List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="animate-spin w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="font-medium">Loading todos...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="text-6xl mb-4">
              {filter === 'completed' ? '🎯' : filter === 'active' ? '🌟' : '📝'}
            </div>
            <p className="text-lg font-medium mb-1">
              {filter === 'completed'
                ? 'No completed todos yet'
                : filter === 'active'
                ? 'No active todos'
                : 'No todos yet'}
            </p>
            <p className="text-sm">
              {filter === 'all'
                ? 'Add your first todo above to get started!'
                : filter === 'active'
                ? 'All done! Great work! 🎉'
                : 'Complete some todos to see them here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onEdit={setEditingTodo}
                onDelete={setDeletingTodo}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        {todos.length > 0 && !loading && (
          <p className="text-center text-xs text-gray-400 mt-8">
            {completedCount === totalCount && totalCount > 0
              ? '🎉 All todos completed!'
              : `${totalCount - completedCount} remaining`}
          </p>
        )}
      </div>

      {/* Edit Modal */}
      {editingTodo && (
        <EditModal
          todo={editingTodo}
          onSave={handleSaveEdit}
          onClose={() => setEditingTodo(null)}
        />
      )}

      {/* Delete Confirm */}
      {deletingTodo && (
        <DeleteConfirm
          todo={deletingTodo}
          onConfirm={handleDelete}
          onClose={() => setDeletingTodo(null)}
        />
      )}
    </div>
  );
}
