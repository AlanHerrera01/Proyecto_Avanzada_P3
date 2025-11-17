import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, RotateCcw, FileText } from "lucide-react";

import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { AlertMessage } from "../components/ui/AlertMessage";

import { loanService } from "../services/loanService";
import { userService } from "../services/userService";
import { bookService } from "../services/bookService";

import type { Loan, LoanFormData, User, Book } from "../types";

export const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanFormData>();

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
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar préstamos");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch {
      console.error("Error al cargar usuarios");
    }
  };

  const loadBooks = async () => {
    try {
      const data = await bookService.getAll();
      setBooks(data.filter((b) => b.disponible));
    } catch {
      console.error("Error al cargar libros");
    }
  };

  const onSubmit = async (data: LoanFormData) => {
    try {
      setLoading(true);

      await loanService.create(data);
      setSuccess("Préstamo creado correctamente");

      await loadLoans();
      await loadBooks();

      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear préstamo");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId: number) => {
    if (!confirm("¿Confirmar devolución del libro?")) return;

    try {
      setLoading(true);

      await loanService.returnBook(loanId);
      setSuccess("Libro devuelto correctamente");

      await loadLoans();
      await loadBooks();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al devolver libro");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset({ usuarioId: undefined, libroId: undefined });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
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

        {/* ENCABEZADO */}
        <div className="bg-white rounded-4 shadow-sm px-4 py-4 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-md-between">
          <div>
            <h1 className="display-4 fw-bold mb-1" style={{ color: "#1565c0" }}>
              Control de Préstamos
            </h1>
            <p className="text-secondary mb-0" style={{ fontSize: "1.1rem" }}>
              Gestiona los préstamos y devoluciones de libros
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary d-flex align-items-center px-4 py-2 fs-5 shadow-sm"
          >
            <Plus size={22} className="me-2" />
            Nuevo Préstamo
          </Button>
        </div>

        {/* LISTADO */}
        {loading && loans.length === 0 ? (
          <p className="text-center mt-5">Cargando préstamos...</p>
        ) : loans.length === 0 ? (
          <div className="text-center py-5">
            <div
              className="bg-primary bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{ width: 80, height: 80 }}
            >
              <FileText size={40} className="text-primary" />
            </div>
            <p className="text-secondary fs-5 fw-semibold">
              No hay préstamos registrados
            </p>
            <p className="text-muted">Crea tu primer préstamo</p>
          </div>
        ) : (
          <div className="table-responsive rounded-3 shadow-sm border bg-white">
            <table className="table align-middle mb-0">
              <thead className="table-primary">
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Libro</th>
                  <th>Fecha Préstamo</th>
                  <th>Fecha Devolución</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>
                      <span className="fw-bold text-primary">#{loan.id}</span>
                    </td>
                    <td className="fw-semibold">{loan.usuarioNombre}</td>
                    <td className="text-secondary">{loan.libroTitulo}</td>
                    <td className="text-secondary small">
                      {formatDate(loan.fechaPrestamo)}
                    </td>
                    <td className="text-secondary small">
                      {loan.fechaDevolucion
                        ? formatDate(loan.fechaDevolucion)
                        : "-"}
                    </td>

                    <td>
                      <span
                        className={`badge rounded-pill px-3 py-2 fw-bold ${
                          loan.fechaDevolucion
                            ? "bg-secondary bg-opacity-75"
                            : "bg-warning bg-opacity-75"
                        }`}
                      >
                        {loan.fechaDevolucion ? "Devuelto" : "Activo"}
                      </span>
                    </td>

                    <td>
                      {!loan.fechaDevolucion && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleReturn(loan.id)}
                        >
                          <RotateCcw size={16} className="me-1" />
                          Devolver
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL – NUEVO PRÉSTAMO */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Nuevo Préstamo"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <Select
                label="Usuario"
                {...register("usuarioId", {
                  required: "El usuario es obligatorio",
                  valueAsNumber: true,
                  validate: (v) => v > 0 || "Selecciona un usuario válido",
                })}
                options={users.map((u) => ({
                  value: u.id,
                  label: `${u.nombre} (${u.email})`,
                }))}
                error={errors.usuarioId?.message}
              />
            </div>

            <div className="mb-3">
              <Select
                label="Libro Disponible"
                {...register("libroId", {
                  required: "El libro es obligatorio",
                  valueAsNumber: true,
                  validate: (v) => v > 0 || "Selecciona un libro válido",
                })}
                options={books.map((b) => ({ value: b.id, label: b.titulo }))}
                error={errors.libroId?.message}
              />
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Crear Préstamo"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
