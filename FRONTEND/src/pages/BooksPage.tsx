import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { AlertMessage } from "../components/ui/AlertMessage";

import { bookService } from "../services/bookService";
import { authorService } from "../services/authorService";

import type { Book, BookFormData, Author } from "../types";

export const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookFormData>();

  useEffect(() => {
    loadBooks();
    loadAuthors();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAll();
      setBooks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar libros");
    } finally {
      setLoading(false);
    }
  };

  const loadAuthors = async () => {
    try {
      const data = await authorService.getAll();
      setAuthors(data);
    } catch (err) {
      console.error("Error al cargar autores");
    }
  };

  const onSubmit = async (data: BookFormData) => {
    try {
      setLoading(true);

      if (editingBook) {
        await bookService.update(editingBook.id, data);
        setSuccess("Libro actualizado correctamente");
      } else {
        await bookService.create(data);
        setSuccess("Libro creado exitosamente");
      }

      await loadBooks();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar libro");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este libro?")) return;

    try {
      setLoading(true);
      await bookService.delete(id);
      setSuccess("Libro eliminado correctamente");
      await loadBooks();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar libro");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    reset({
      titulo: book.titulo,
      autorId: book.autorId,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
    reset({ titulo: "", autorId: undefined });
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        {/* 🔔 Alertas */}
        <AlertMessage
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
        <AlertMessage
          message={error}
          type="error"
          onClose={() => setError(null)}
        />

        {/* Encabezado */}
        <div className="bg-white rounded-4 shadow-sm px-4 py-4 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-md-between">
          <div>
            <h1 className="display-4 fw-bold mb-1" style={{ color: "#1565c0" }}>
              Catálogo de Libros
            </h1>
            <p className="text-secondary mb-0" style={{ fontSize: "1.1rem" }}>
              Administra tu colección literaria
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary d-flex align-items-center px-4 py-2 fs-5 shadow-sm"
          >
            <Plus size={22} className="me-2" />
            Nuevo Libro
          </Button>
        </div>

        {/* Listado */}
        {loading && books.length === 0 ? (
          <p className="text-center mt-4">Cargando libros...</p>
        ) : books.length === 0 ? (
          <div className="text-center py-5">
            <div
              className="bg-primary bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{ width: 80, height: 80 }}
            >
              <BookOpen size={40} className="text-primary" />
            </div>
            <p className="text-secondary fs-5 fw-semibold">
              No hay libros registrados
            </p>
            <p className="text-muted">Agrega tu primer libro para comenzar</p>
          </div>
        ) : (
          <div className="row g-4">
            {books.map((book) => (
              <div key={book.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm">
                  <div
                    className="card-header bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                    style={{ height: "90px" }}
                  >
                    <BookOpen size={40} className="text-primary opacity-50" />
                  </div>
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title fw-bold text-dark mb-1 text-truncate">
                        {book.titulo}
                      </h5>
                      <p className="card-text text-secondary text-truncate">
                        {book.autorNombre}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span
                        className={`badge rounded-pill px-3 py-2 fw-bold ${
                          book.disponible
                            ? "bg-success bg-opacity-75"
                            : "bg-danger bg-opacity-75"
                        }`}
                      >
                        {book.disponible ? "Disponible" : "Prestado"}
                      </span>
                      <div className="d-flex gap-2">
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingBook ? "Editar Libro" : "Nuevo Libro"}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <Input
                label="Título del Libro"
                placeholder="Ingresa el título"
                {...register("titulo", {
                  required: "El título es obligatorio",
                })}
                error={errors.titulo?.message}
              />
            </div>

            <div className="mb-3">
              <Select
                label="Autor"
                {...register("autorId", {
                  required: "Debes seleccionar un autor",
                  valueAsNumber: true,
                  validate: (v) => v > 0 || "Selecciona un autor válido",
                })}
                options={authors.map((a) => ({ value: a.id, label: a.nombre }))}
                error={errors.autorId?.message}
              />
            </div>

            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Guardando..."
                  : editingBook
                  ? "Actualizar"
                  : "Crear Libro"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
