import api from './api';
import type { User, UserFormData } from '../types';

export const userService = {
  // Obtener todos los usuarios
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  // Obtener usuario por ID
  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Crear usuario
  create: async (data: UserFormData): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  // Actualizar usuario
  update: async (id: number, data: UserFormData): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  // Eliminar usuario
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
