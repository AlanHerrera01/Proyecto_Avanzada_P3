import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { bookService } from '../services/bookService';
import { authorService } from '../services/authorService';
import type { Book, BookFormData, Author } from '../types';

export const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookFormData>();

  useEffect(() => {
    loadBooks();
    loadAuthors();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAll();
      setBooks(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar libros');
    } finally {
      setLoading(false);
    }
  };

  const loadAuthors = async () => {
    try {
      const data = await authorService.getAll();
      setAuthors(data);
    } catch (err) {
      console.error('Error al cargar autores');
    }
  };

  const onSubmit = async (data: BookFormData) => {
    try {
      setLoading(true);
      const formData = {
        ...data,
        autorId: Number(data.autorId),
      };
      if (editingBook) {
        await bookService.update(editingBook.id, formData);
      } else {
        await bookService.create(formData);
      }
      await loadBooks();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar libro');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este libro?')) return;
    
    try {
      setLoading(true);
      await bookService.delete(id);
      await loadBooks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar libro');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    reset(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
    reset({ titulo: '', autorId: 0 });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Libros</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Nuevo Libro
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card>
        {loading && books.length === 0 ? (
          <div className="text-center py-8">Cargando...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay libros registrados
          </div>
        ) : (
          <Table headers={['ID', 'Título', 'Autor', 'Disponible', 'Acciones']}>
            {books.map((book) => (
              <tr key={book.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {book.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {book.titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {book.autorNombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    book.disponible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {book.disponible ? 'Disponible' : 'Prestado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(book)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(book.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBook ? 'Editar Libro' : 'Nuevo Libro'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Título"
            {...register('titulo', { 
              required: 'El título es obligatorio',
            })}
            error={errors.titulo?.message}
          />

          <Select
            label="Autor"
            {...register('autorId', { 
              required: 'El autor es obligatorio',
            })}
            options={authors.map(a => ({ value: a.id, label: a.nombre }))}
            error={errors.autorId?.message}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
