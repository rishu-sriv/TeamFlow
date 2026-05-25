import { create } from 'zustand'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  taskHistory: [],
  loading: false,
  error: null,
  filters: { status: '', priority: '', assignee_id: '' },

  setTasks: (tasks) => set({ tasks }),
  setCurrentTask: (task) => set({ currentTask: task }),
  setTaskHistory: (history) => set({ taskHistory: history }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: { status: '', priority: '', assignee_id: '' } }),

  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),

  updateTask: (updated) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
      currentTask: state.currentTask?.id === updated.id
        ? { ...state.currentTask, ...updated }
        : state.currentTask,
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      currentTask: state.currentTask?.id === id ? null : state.currentTask,
    })),

  reset: () =>
    set({ tasks: [], currentTask: null, taskHistory: [], loading: false, error: null }),
}))
