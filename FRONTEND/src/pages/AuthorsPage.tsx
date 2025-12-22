import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { authorService } from "../services/authorService";
import { AlertMessage } from "../components/ui/AlertMessage";
import type { Author, AuthorFormData } from "../types";

export const AuthorsPage: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthorFormData>();

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      const data = await authorService.getAll();
      setAuthors(data);
      setError(null);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AuthorFormData) => {
    try {
      setLoading(true);
      if (editingAuthor) {
        await authorService.update(editingAuthor.id, data);
        setSuccess("Autor actualizado correctamente");
      } else {
        await authorService.create(data);
        setSuccess("Autor creado exitosamente");
      }
      await loadAuthors();
      handleCloseModal();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este autor?")) return;
    try {
      setLoading(true);
      await authorService.delete(id);
      setSuccess("Autor eliminado correctamente");
      await loadAuthors();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    reset(author);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAuthor(null);
    reset();
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
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

        <div className="bg-white rounded-4 shadow-lg px-5 py-4 mb-5 d-flex flex-column flex-md-row align-items-md-center justify-content-md-between border border-primary border-opacity-20">
          <div>
            <h1 className="display-4 fw-bold mb-1 text-primary">Autores</h1>
            <p className="text-secondary mb-0 fs-5">Gestiona los autores de tu biblioteca</p>
          </div>
          <button 
            onClick={() => {
              setEditingAuthor(null);
              reset();
              setIsModalOpen(true);
            }}
            className="btn btn-primary d-flex align-items-center px-4 py-2 fs-5 shadow-lg rounded-pill hover:shadow-xl transition-all"
            style={{ minWidth: 200 }}
          >
            <Plus size={22} className="me-2" />
            Nuevo Autor
          </button>
        </div>

        {loading && authors.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-secondary fs-5 fw-semibold">Cargando autores...</p>
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-lg">
            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{width: '100px', height: '100px'}}>
              <Edit2 size={50} className="text-primary" />
            </div>
            <p className="text-secondary fs-4 fw-bold mb-2">No hay autores registrados</p>
            <p className="text-muted fs-6 mb-4">Agrega tu primer autor para comenzar</p>
            <button 
              onClick={() => {
                setEditingAuthor(null);
                reset();
                setIsModalOpen(true);
              }}
              className="btn btn-primary rounded-pill px-4 py-2 shadow hover:shadow-lg transition-all"
            >
              <Plus size={20} className="me-2" />
              Agregar Primer Autor
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {authors.map((author) => (
              <div key={author.id} className="col-md-3">
                <div className="card h-100 shadow-lg border-0 rounded-3 hover:shadow-xl transition-all">
                  <div
                    className="card-header bg-primary bg-opacity-10 d-flex align-items-center justify-content-center rounded-top-3"
                    style={{ height: "100px" }}
                  >
                    <Edit2 size={45} className="text-primary" />
                  </div>
                  <div className="card-body d-flex flex-column justify-content-between p-4">
                    <div>
                      <h5 className="card-title fw-bold text-dark mb-2 text-truncate fs-5">
                        {author.nombre}
                      </h5>
                      <p className="card-text text-secondary mb-3 text-truncate small">
                        {author.nacionalidad}
                      </p>
                    </div>
                    <div className="d-flex justify-content-end gap-2 mt-auto">
                      <button 
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 d-flex align-items-center hover:shadow-md transition-all"
                        onClick={() => handleEdit(author)}
                      >
                        <Edit2 size={14} className="me-1" />
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 d-flex align-items-center hover:shadow-md transition-all"
                        onClick={() => handleDelete(author.id)}
                      >
                        <Trash2 size={14} className="me-1" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingAuthor ? "Editar Autor" : "Nuevo Autor"}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <Edit2 size={40} className="text-primary" />
              </div>
              <h4 className="text-primary fw-bold mb-2">
                {editingAuthor ? "Editando Información del Autor" : "Agregando Nuevo Autor"}
              </h4>
              <p className="text-muted">
                {editingAuthor ? "Modifica los datos del autor seleccionado" : "Completa los datos para registrar un nuevo autor en la biblioteca"}
              </p>
            </div>

            <div className="row g-3">
              <div className="col-12">
                <div className="form-floating">
                  <input
                    type="text"
                    className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                    id="nombre"
                    placeholder="Nombre del autor"
                    {...register("nombre", {
                      required: "El nombre es obligatorio",
                      minLength: {
                        value: 2,
                        message: "El nombre debe tener al menos 2 caracteres"
                      }
                    })}
                  />
                  <label htmlFor="nombre" className="text-primary fw-semibold">
                    <Edit2 size={16} className="me-2" />
                    Nombre del Autor
                  </label>
                  {errors.nombre && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.nombre.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12">
                <div className="form-floating">
                  <input
                    type="text"
                    className={`form-control ${errors.nacionalidad ? 'is-invalid' : ''}`}
                    id="nacionalidad"
                    placeholder="Nacionalidad del autor"
                    {...register("nacionalidad", {
                      required: "La nacionalidad es obligatoria",
                      minLength: {
                        value: 2,
                        message: "La nacionalidad debe tener al menos 2 caracteres"
                      }
                    })}
                  />
                  <label htmlFor="nacionalidad" className="text-primary fw-semibold">
                    <i className="bi bi-globe me-2"></i>
                    Nacionalidad del Autor
                  </label>
                  {errors.nacionalidad && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.nacionalidad.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
              <div className="text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                {editingAuthor ? "Los cambios se guardarán al hacer clic en Actualizar" : "Todos los campos son obligatorios"}
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
                  ) : editingAuthor ? (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Actualizar Autor
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Crear Autor
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
