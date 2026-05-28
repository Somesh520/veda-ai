import { create } from 'zustand';
import { IAssignment } from '../types/assignment';
import {
  fetchAssignments,
  fetchAssignmentById,
  createAssignment as apiCreateAssignment,
  deleteAssignment as apiDeleteAssignment,
  regenerateAssignment as apiRegenerateAssignment,
} from '../services/api';

interface AssessmentState {
  assignments: IAssignment[];
  currentAssignment: IAssignment | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  
  loadAssignments: () => Promise<void>;
  loadAssignmentById: (id: string) => Promise<IAssignment>;
  createNewAssignment: (formData: FormData) => Promise<IAssignment>;
  removeAssignment: (id: string) => Promise<void>;
  triggerRegeneration: (id: string) => Promise<void>;
  updateAssignmentStatus: (id: string, status: IAssignment['status'], updatedAssignmentData?: any) => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assignments: [],
  currentAssignment: null,
  isLoading: false,
  isGenerating: false,
  error: null,

  loadAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchAssignments();
      set({ assignments: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load assignments', isLoading: false });
    }
  },

  loadAssignmentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchAssignmentById(id);
      set({ currentAssignment: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch assignment details', isLoading: false });
      throw err;
    }
  },

  createNewAssignment: async (formData: FormData) => {
    set({ isGenerating: true, error: null });
    try {
      const res = await apiCreateAssignment(formData);
      // Append new assignment to top of list
      set((state) => ({
        assignments: [res.assignment, ...state.assignments],
        currentAssignment: res.assignment,
        isGenerating: false,
      }));
      return res.assignment;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create assignment', isGenerating: false });
      throw err;
    }
  },

  removeAssignment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiDeleteAssignment(id);
      set((state) => ({
        assignments: state.assignments.filter((a) => a._id !== id),
        currentAssignment: state.currentAssignment?._id === id ? null : state.currentAssignment,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete assignment', isLoading: false });
    }
  },

  triggerRegeneration: async (id: string) => {
    set({ isGenerating: true, error: null });
    try {
      const res = await apiRegenerateAssignment(id);
      set((state) => ({
        assignments: state.assignments.map((a) => (a._id === id ? res.assignment : a)),
        currentAssignment: res.assignment,
        isGenerating: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to regenerate assignment', isGenerating: false });
    }
  },

  updateAssignmentStatus: (id: string, status: IAssignment['status'], updatedAssignmentData?: any) => {
    set((state) => {
      const updatedAssignments = state.assignments.map((a) => {
        if (a._id === id) {
          return {
            ...a,
            status,
            ...(updatedAssignmentData || {}),
          };
        }
        return a;
      });

      const isCurrent = state.currentAssignment?._id === id;
      const updatedCurrent = isCurrent
        ? {
            ...state.currentAssignment!,
            status,
            ...(updatedAssignmentData || {}),
          }
        : state.currentAssignment;

      return {
        assignments: updatedAssignments,
        currentAssignment: updatedCurrent,
      };
    });
  },
}));
