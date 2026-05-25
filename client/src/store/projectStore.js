import { create } from 'zustand'

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  members: [],
  loading: false,
  error: null,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setMembers: (members) => set({ members }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),

  updateProject: (updated) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
      currentProject: state.currentProject?.id === updated.id
        ? { ...state.currentProject, ...updated }
        : state.currentProject,
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),

  addMember: (member) => set((state) => ({ members: [...state.members, member] })),

  removeMember: (userId) =>
    set((state) => ({ members: state.members.filter((m) => m.user_id !== userId) })),

  updateMemberRole: (userId, role) =>
    set((state) => ({
      members: state.members.map((m) => (m.user_id === userId ? { ...m, role } : m)),
    })),

  reset: () => set({ projects: [], currentProject: null, members: [], loading: false, error: null }),
}))
