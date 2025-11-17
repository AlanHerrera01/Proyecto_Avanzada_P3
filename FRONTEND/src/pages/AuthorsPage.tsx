import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import { Button } from "../components/ui/Button";
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar autores");
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar autor");
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar autor");
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

        <div className="bg-white rounded-4 shadow-sm px-4 py-4 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-md-between">
          <div>
            <h1 className="display-4 fw-bold mb-1" style={{ color: "#1565c0" }}>
              Autores
            </h1>
            <p className="text-secondary">
              Gestiona los autores de tu biblioteca
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingAuthor(null);
              reset();
              setIsModalOpen(true);
            }}
            className="btn btn-primary d-flex align-items-center px-4 py-2 fs-5 shadow-sm"
          >
            <Plus size={22} className="me-2" />
            Nuevo Autor
          </Button>
        </div>

        {loading && authors.length === 0 ? (
          <p className="text-center">Cargando...</p>
        ) : authors.length === 0 ? (
          <p className="text-center">No hay autores registrados</p>
        ) : (
          <div className="row g-4">
            {authors.map((author) => (
              <div key={author.id} className="col-md-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="fw-bold">{author.nombre}</h5>
                    <p className="text-secondary">{author.nacionalidad}</p>
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(author)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(author.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
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
            <div className="mb-3">
              <label>Nombre</label>
              <input
                className={`form-control${errors.nombre ? " is-invalid" : ""}`}
                {...register("nombre", {
                  required: "El nombre es obligatorio",
                })}
              />
              {errors.nombre && (
                <div className="invalid-feedback">{errors.nombre.message}</div>
              )}
            </div>
            <div className="mb-3">
              <label>Nacionalidad</label>
              <input
                className={`form-control${
                  errors.nacionalidad ? " is-invalid" : ""
                }`}
                {...register("nacionalidad", {
                  required: "La nacionalidad es obligatoria",
                })}
              />
              {errors.nacionalidad && (
                <div className="invalid-feedback">
                  {errors.nacionalidad.message}
                </div>
              )}
            </div>
            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Guardando..."
                  : editingAuthor
                  ? "Actualizar"
                  : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
