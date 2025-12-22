import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
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
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAuthors = async () => {
    try {
      const data = await authorService.getAll();
      setAuthors(data);
    } catch {
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
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
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
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
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
        <div className="bg-white rounded-4 shadow-lg px-5 py-4 mb-5 d-flex flex-column flex-md-row align-items-md-center justify-content-md-between border border-primary border-opacity-20">
          <div>
            <h1 className="display-4 fw-bold mb-1 text-primary">Catálogo de Libros</h1>
            <p className="text-secondary mb-0 fs-5">Administra tu colección literaria</p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn btn-primary d-flex align-items-center px-4 py-2 fs-5 shadow-lg rounded-pill hover:shadow-xl transition-all"
            style={{ minWidth: 200 }}
          >
            <Plus size={22} className="me-2" />
            Nuevo Libro
          </button>
        </div>

        {/* Listado */}
        {loading && books.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-secondary fs-5 fw-semibold">Cargando libros...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-lg">
            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{width: '100px', height: '100px'}}>
              <BookOpen size={50} className="text-primary" />
            </div>
            <p className="text-secondary fs-4 fw-bold mb-2">No hay libros registrados</p>
            <p className="text-muted fs-6 mb-4">Agrega tu primer libro para comenzar</p>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="btn btn-primary rounded-pill px-4 py-2 shadow hover:shadow-lg transition-all"
            >
              <Plus size={20} className="me-2" />
              Agregar Primer Libro
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {books.map((book) => (
              <div key={book.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-lg border-0 rounded-3 hover:shadow-xl transition-all">
                  <div
                    className="card-header bg-primary bg-opacity-10 d-flex align-items-center justify-content-center rounded-top-3"
                    style={{ height: "120px" }}
                  >
                    <BookOpen size={50} className="text-primary" />
                  </div>
                  <div className="card-body d-flex flex-column justify-content-between p-3">
                    <div className="text-center">
                      <h5 className="card-title fw-bold text-dark mb-2 fs-6" style={{height: "48px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                        {book.titulo}
                      </h5>
                      <p className="card-text text-secondary mb-3 small" style={{height: "20px"}}>
                        {book.autorNombre}
                      </p>
                    </div>
                    <div className="d-flex flex-column gap-2 mt-auto">
                      <div className="text-center">
                        <span
                          className={`badge rounded-pill px-3 py-2 fw-bold shadow-sm ${book.disponible ? "bg-success text-white" : "bg-danger text-white"}`}
                        >
                          {book.disponible ? "Disponible" : "Prestado"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-center gap-2">
                        <button 
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 d-flex align-items-center hover:shadow-md transition-all"
                          onClick={() => handleEdit(book)}
                        >
                          <Edit2 size={12} className="me-1" />
                          Editar
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 d-flex align-items-center hover:shadow-md transition-all"
                          onClick={() => handleDelete(book.id)}
                        >
                          <Trash2 size={12} className="me-1" />
                          Eliminar
                        </button>
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
          <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
              <BookOpen size={40} className="text-primary" />
            </div>
            <h4 className="text-primary fw-bold mb-2">
              {editingBook ? "Editando Información del Libro" : "Agregando Nuevo Libro"}
            </h4>
            <p className="text-muted">
              {editingBook ? "Modifica los datos del libro seleccionado" : "Completa los datos para registrar un nuevo libro en la biblioteca"}
            </p>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <div className="form-floating">
                <input
                  type="text"
                  className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                  id="titulo"
                  placeholder="Título del libro"
                  {...register("titulo", {
                    required: "El título es obligatorio",
                    minLength: {
                      value: 2,
                      message: "El título debe tener al menos 2 caracteres"
                    }
                  })}
                />
                <label htmlFor="titulo" className="text-primary fw-semibold">
                  <BookOpen size={16} className="me-2" />
                  Título del Libro
                </label>
                {errors.titulo && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.titulo.message}
                  </div>
                )}
              </div>
            </div>

            <div className="col-12">
              <div className="form-floating">
                <select
                  className={`form-select ${errors.autorId ? 'is-invalid' : ''}`}
                  id="autorId"
                  {...register("autorId", {
                    required: "Debes seleccionar un autor",
                    valueAsNumber: true,
                    validate: (v) => v > 0 || "Selecciona un autor válido",
                  })}
                >
                  <option value="">Selecciona un autor...</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.nombre} ({author.nacionalidad})
                    </option>
                  ))}
                </select>
                <label htmlFor="autorId" className="text-primary fw-semibold">
                  <Edit2 size={16} className="me-2" />
                  Autor del Libro
                </label>
                {errors.autorId && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.autorId.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
            <div className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              {editingBook ? "Los cambios se guardarán al hacer clic en Actualizar" : "Todos los campos son obligatorios"}
            </div>
            <div className="d-flex gap-2">
              <button 
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4 py-2 d-flex align-items-center hover:shadow-md transition-all"
                onClick={handleCloseModal}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center hover:shadow-md transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Guardando...
                  </>
                ) : editingBook ? (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Actualizar Libro
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Libro
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  );
};
