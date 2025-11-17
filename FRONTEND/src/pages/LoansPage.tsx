import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, RotateCcw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { loanService } from '../services/loanService';
import { userService } from '../services/userService';
import { bookService } from '../services/bookService';
import type { Loan, LoanFormData, User, Book } from '../types';

export const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LoanFormData>();

  useEffect(() => {
    loadLoans();
    loadUsers();
    loadBooks();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await loanService.getAll();
      setLoans(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Error al cargar usuarios');
    }
  };

  const loadBooks = async () => {
    try {
      const data = await bookService.getAll();
      setBooks(data.filter(b => b.disponible)); // Solo libros disponibles
    } catch (err) {
      console.error('Error al cargar libros');
    }
  };

  const onSubmit = async (data: LoanFormData) => {
    try {
      setLoading(true);
      const formData = {
        usuarioId: Number(data.usuarioId),
        libroId: Number(data.libroId),
      };
      await loanService.create(formData);
      await loadLoans();
      await loadBooks(); // Recargar libros para actualizar disponibilidad
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear préstamo');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id: number) => {
    if (!confirm('¿Confirmar devolución del libro?')) return;
    
    try {
      setLoading(true);
      await loanService.returnBook(id);
      await loadLoans();
      await loadBooks(); // Recargar libros para actualizar disponibilidad
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al devolver libro');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset({ usuarioId: 0, libroId: 0 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Préstamos</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Nuevo Préstamo
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card>
        {loading && loans.length === 0 ? (
          <div className="text-center py-8">Cargando...</div>
        ) : loans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay préstamos registrados
          </div>
        ) : (
          <Table headers={['ID', 'Usuario', 'Libro', 'Fecha Préstamo', 'Fecha Devolución', 'Estado', 'Acciones']}>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {loan.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {loan.usuarioNombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {loan.libroTitulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(loan.fechaPrestamo)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {loan.fechaDevolucion ? formatDate(loan.fechaDevolucion) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    loan.fechaDevolucion 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {loan.fechaDevolucion ? 'Devuelto' : 'Activo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {!loan.fechaDevolucion && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleReturn(loan.id)}
                    >
                      <RotateCcw size={16} className="mr-1" />
                      Devolver
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Nuevo Préstamo"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Usuario"
            {...register('usuarioId', { 
              required: 'El usuario es obligatorio',
            })}
            options={users.map(u => ({ value: u.id, label: `${u.nombre} (${u.email})` }))}
            error={errors.usuarioId?.message}
          />

          <Select
            label="Libro"
            {...register('libroId', { 
              required: 'El libro es obligatorio',
            })}
            options={books.map(b => ({ value: b.id, label: b.titulo }))}
            error={errors.libroId?.message}
          />

          {books.length === 0 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              No hay libros disponibles para préstamo
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || books.length === 0}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
