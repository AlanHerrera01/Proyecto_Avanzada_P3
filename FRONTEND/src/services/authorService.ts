import api from './api';
import type { Author, AuthorFormData } from '../types';

export const authorService = {
  // Obtener todos los autores
  getAll: async (): Promise<Author[]> => {
    const response = await api.get<Author[]>('/authors');
    return response.data;
  },

  // Obtener autor por ID
  getById: async (id: number): Promise<Author> => {
    const response = await api.get<Author>(`/authors/${id}`);
    return response.data;
  },

  // Crear autor
  create: async (data: AuthorFormData): Promise<Author> => {
    const response = await api.post<Author>('/authors', data);
    return response.data;
  },

  // Actualizar autor
  update: async (id: number, data: AuthorFormData): Promise<Author> => {
    const response = await api.put<Author>(`/authors/${id}`, data);
    return response.data;
  },

  // Eliminar autor
  delete: async (id: number): Promise<void> => {
    await api.delete(`/authors/${id}`);
  },
};
