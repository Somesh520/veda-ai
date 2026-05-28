import { IAssignment } from '../types/assignment';

const API_BASE_URL = '/api/assignments';

export const fetchAssignments = async (): Promise<IAssignment[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch assignments');
  }
  return response.json();
};

export const fetchAssignmentById = async (id: string): Promise<IAssignment> => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch assignment with ID: ${id}`);
  }
  return response.json();
};

export const createAssignment = async (formData: FormData): Promise<{ message: string; assignment: IAssignment }> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    body: formData, // Browser automatically sets appropriate multipart/form-data boundary
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create assignment');
  }
  return response.json();
};

export const deleteAssignment = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete assignment with ID: ${id}`);
  }
  return response.json();
};

export const regenerateAssignment = async (id: string): Promise<{ message: string; assignment: IAssignment }> => {
  const response = await fetch(`${API_BASE_URL}/${id}/regenerate`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to regenerate assignment with ID: ${id}`);
  }
  return response.json();
};
