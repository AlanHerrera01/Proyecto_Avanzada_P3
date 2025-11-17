// Tipos para Usuarios
export interface User {
  id: number;
  nombre: string;
  email: string;
}

export interface UserFormData {
  nombre: string;
  email: string;
}

// Tipos para Autores
export interface Author {
  id: number;
  nombre: string;
  nacionalidad?: string;
}

export interface AuthorFormData {
  nombre: string;
  nacionalidad?: string;
}

// Tipos para Libros
export interface Book {
  id: number;
  titulo: string;
  autorId: number;
  autorNombre?: string;
  disponible: boolean;
}

export interface BookFormData {
  titulo: string;
  autorId: number;
  disponible?: boolean;
}

// Tipos para Préstamos
export interface Loan {
  id: number;
  usuarioNombre: string;
  libroTitulo: string;
  fechaPrestamo: string;
  fechaDevolucion?: string | null;
}

export interface LoanFormData {
  usuarioId: number;
  libroId: number;
}

// Tipos de respuesta de la API
export interface ApiError {
  timestamp: string;
  status: number;
  error?: string;
  message: string;
  errors?: Record<string, string>;
}
