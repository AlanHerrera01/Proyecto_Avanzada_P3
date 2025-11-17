import api from './api';
import type { Loan, LoanFormData } from '../types';

export const loanService = {
  // Obtener todos los préstamos
  getAll: async (): Promise<Loan[]> => {
    const response = await api.get<Loan[]>('/loans');
    return response.data;
  },

  // Obtener préstamo por ID
  getById: async (id: number): Promise<Loan> => {
    const response = await api.get<Loan>(`/loans/${id}`);
    return response.data;
  },

  // Crear préstamo
  create: async (data: LoanFormData): Promise<Loan> => {
    const response = await api.post<Loan>('/loans', data);
    return response.data;
  },

  // Devolver libro
  returnBook: async (id: number): Promise<Loan> => {
    const response = await api.post<Loan>(`/loans/${id}/return`);
    return response.data;
  },
};
