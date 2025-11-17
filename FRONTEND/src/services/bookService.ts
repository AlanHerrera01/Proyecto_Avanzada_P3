import api from './api';
import type { Book, BookFormData } from '../types';

export const bookService = {
  // Obtener todos los libros
  getAll: async (): Promise<Book[]> => {
    const response = await api.get<Book[]>('/books');
    return response.data;
  },

  // Obtener libro por ID
  getById: async (id: number): Promise<Book> => {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  },

  // Crear libro
  create: async (data: BookFormData): Promise<Book> => {
    const response = await api.post<Book>('/books', data);
    return response.data;
  },

  // Actualizar libro
  update: async (id: number, data: BookFormData): Promise<Book> => {
    const response = await api.put<Book>(`/books/${id}`, data);
    return response.data;
  },

  // Eliminar libro
  delete: async (id: number): Promise<void> => {
    await api.delete(`/books/${id}`);
  },
};
