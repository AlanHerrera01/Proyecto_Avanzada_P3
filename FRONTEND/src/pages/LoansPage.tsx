import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, RotateCcw, FileText, Activity, BookOpen } from "lucide-react";

import { Modal } from "../components/ui/Modal";
import { AlertMessage } from "../components/ui/AlertMessage";

import { userService } from "../services/userService";
import { bookService } from "../services/bookService";
import { reactiveApi } from "../services/reactiveApi";

import { useEventBus, useSystemMetrics, useEventPublisher } from "../hooks/useEventBus";
import type { Loan, LoanFormData, User, Book } from "../types";

export const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hooks reactivos
  const systemMetrics = useSystemMetrics();
  const { publishLoanEvent, publishSystemEvent } = useEventPublisher();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanFormData>();

  // Funciones de carga memoizadas
  const loadLoans = React.useCallback(async () => {
    try {
      setLoading(true);
      publishSystemEvent('Iniciando carga de préstamos', 'info');
      
      // Usar API reactiva con métricas
      reactiveApi.getLoansReactive().subscribe({
        next: (data) => {
          const loansData = data as Loan[];
          setLoans(loansData);
          publishSystemEvent(`Préstamos cargados: ${loansData.length}`, 'info', { count: loansData.length });
        },
        error: (err) => {
          setError(err instanceof Error ? err.message : "Error al cargar préstamos");
          publishSystemEvent('Error cargando préstamos', 'error', { error: err instanceof Error ? err.message : 'Unknown error' });
        },
        complete: () => {
          setLoading(false);
        }
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
      setLoading(false);
    }
  }, [publishSystemEvent]);

  const loadUsers = React.useCallback(async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch {
      console.error("Error al cargar usuarios");
    }
  }, []);

  const loadBooks = React.useCallback(async () => {
    try {
      const data = await bookService.getAll();
      setBooks(data.filter((b) => b.disponible));
    } catch {
      console.error("Error al cargar libros");
    }
  }, []);

  // Función memoizada para loadLoans
  const memoizedLoadLoans = React.useCallback(() => {
    loadLoans();
  }, [loadLoans]);

  useEffect(() => {
    // Iniciar carga de datos al montar el componente
    const initializeData = async () => {
      await Promise.all([
        loadLoans(),
        loadUsers(),
        loadBooks()
      ]);
    };
    initializeData();
  }, [loadLoans, loadUsers, loadBooks]);

  // Suscribirse a eventos de préstamos en tiempo real
  useEventBus('LOAN_CREATED', () => {
    if (realTimeUpdates) {
      memoizedLoadLoans();
      loadBooks();
      setSuccess('Nuevo préstamo creado en tiempo real');
    }
  });

  useEventBus('LOAN_RETURNED', () => {
    if (realTimeUpdates) {
      memoizedLoadLoans();
      loadBooks();
      setSuccess('Libro devuelto en tiempo real');
    }
  });

  const onSubmit = async (data: LoanFormData) => {
    try {
      setLoading(true);
      publishSystemEvent('Iniciando creación de préstamo', 'info', { userId: data.usuarioId, bookId: data.libroId });

      // Usar API reactiva
      reactiveApi.createLoanReactive(data).subscribe({
        next: (loan) => {
          const loanData = loan as { id: number; usuarioId: number; libroId: number };
          setSuccess("Préstamo creado correctamente");
          publishLoanEvent('LOAN_CREATED', {
            loanId: loanData.id,
            userId: loanData.usuarioId,
            bookId: loanData.libroId
          });
        },
        error: (err) => {
          setError(err instanceof Error ? err.message : "Error al crear préstamo");
          publishSystemEvent('Error creando préstamo', 'error', { error: err instanceof Error ? err.message : 'Unknown error' });
        },
        complete: () => {
          setLoading(false);
          handleCloseModal();
        }
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
      setLoading(false);
    }
  };

  const handleReturn = async (loanId: number) => {
    if (!confirm("¿Confirmar devolución del libro?")) return;

    try {
      setLoading(true);
      publishSystemEvent('Iniciando devolución de libro', 'info', { loanId });

      // Usar API reactiva
      reactiveApi.returnLoanReactive(loanId).subscribe({
        next: (loan) => {
          const loanData = loan as { id: number; usuarioId: number; libroId: number };
          setSuccess("Libro devuelto correctamente");
          publishLoanEvent('LOAN_RETURNED', {
            loanId: loanData.id,
            userId: loanData.usuarioId,
            bookId: loanData.libroId
          });
        },
        error: (err) => {
          setError(err instanceof Error ? err.message : "Error al devolver libro");
          publishSystemEvent('Error devolviendo libro', 'error', { error: err instanceof Error ? err.message : 'Unknown error' });
        },
        complete: () => {
          setLoading(false);
        }
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
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

        
        {/* PANEL DE MÉTRICAS REACTIVAS */}
        <div className="bg-white rounded-4 shadow-lg px-5 py-3 mb-5 border border-primary border-opacity-20">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between">
            <div className="d-flex align-items-center mb-2 mb-md-0">
              <Activity size={24} className="me-3 text-primary" />
              <span className="fw-bold fs-5">Métricas Reactivas:</span>
              <span className="badge bg-success rounded-pill px-3 py-2 ms-3 shadow-sm">Procesados: {systemMetrics.processed}</span>
              <span className="badge bg-danger rounded-pill px-3 py-2 ms-2 shadow-sm">Errores: {systemMetrics.errors}</span>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="realTimeUpdates"
                checked={realTimeUpdates}
                onChange={(e) => setRealTimeUpdates(e.target.checked)}
              />
              <label className="form-check-label fw-semibold" htmlFor="realTimeUpdates">
                Actualizaciones en tiempo real
              </label>
            </div>
          </div>
        </div>

        {/* ENCABEZADO */}
        <div className="bg-white rounded-4 shadow-lg px-5 py-4 mb-5 d-flex flex-column flex-md-row align-items-md-center justify-content-md-between border border-primary border-opacity-20">
          <div>
            <h1 className="display-4 fw-bold mb-1 text-primary">Control de Préstamos</h1>
            <p className="text-secondary mb-0 fs-5">Gestiona los préstamos y devoluciones de libros</p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn btn-primary d-flex align-items-center px-4 py-2 fs-5 shadow-lg rounded-pill hover:shadow-xl transition-all"
            style={{ minWidth: 200 }}
          >
            <Plus size={22} className="me-2" />
            Nuevo Préstamo
          </button>
        </div>

        {/* LISTADO */}
        {loading && loans.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-secondary fs-5 fw-semibold">Cargando préstamos...</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-lg">
            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{width: '100px', height: '100px'}}>
              <FileText size={50} className="text-primary" />
            </div>
            <p className="text-secondary fs-4 fw-bold mb-2">No hay préstamos activos</p>
            <p className="text-muted fs-6 mb-4">Crea tu primer préstamo para comenzar</p>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="btn btn-primary rounded-pill px-4 py-2 shadow hover:shadow-lg transition-all"
            >
              <Plus size={20} className="me-2" />
              Crear Primer Préstamo
            </button>
          </div>
        ) : (
          <div className="table-responsive rounded-3 shadow-lg border bg-white">
            <table className="table align-middle mb-0">
              <thead className="bg-primary bg-opacity-10">
                <tr>
                  <th className="fw-bold text-dark">ID</th>
                  <th className="fw-bold text-dark">Usuario</th>
                  <th className="fw-bold text-dark">Libro</th>
                  <th className="fw-bold text-dark">Fecha Préstamo</th>
                  <th className="fw-bold text-dark">Fecha Devolución</th>
                  <th className="fw-bold text-dark">Estado</th>
                  <th className="fw-bold text-dark">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>
                      <span className="fw-bold text-primary">#{loan.id}</span>
                    </td>
                    <td className="fw-semibold">{loan.usuario_nombre}</td>
                    <td className="text-secondary">{loan.libro_titulo}</td>
                    <td className="text-secondary small">
                      {formatDate(loan.fecha_prestamo)}
                    </td>
                    <td className="text-secondary small">
                      {loan.fecha_devolucion
                        ? formatDate(loan.fecha_devolucion)
                        : "-"}
                    </td>

                    <td>
                      <span className={`badge rounded-pill px-3 py-2 fw-bold shadow-sm ${loan.fecha_devolucion ? "bg-secondary text-white" : "bg-primary text-white"}`}>
                        {loan.fecha_devolucion ? "Devuelto" : "Activo"}
                      </span>
                    </td>

                    <td>
                      {!loan.fecha_devolucion && (
                        <button 
                          className="btn btn-sm btn-success rounded-pill px-3 py-1 d-flex align-items-center hover:shadow-md transition-all"
                          onClick={() => handleReturn(loan.id)}
                        >
                          <RotateCcw size={14} className="me-1" />
                          Devolver
                        </button>
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
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <FileText size={40} className="text-primary" />
              </div>
              <h4 className="text-primary fw-bold mb-2">Crear Nuevo Préstamo</h4>
              <p className="text-muted">Registra un nuevo préstamo de libro para un usuario de la biblioteca</p>
            </div>

            <div className="row g-3">
              <div className="col-12">
                <div className="form-floating">
                  <select
                    className={`form-select ${errors.usuarioId ? 'is-invalid' : ''}`}
                    id="usuarioId"
                    {...register("usuarioId", {
                      required: "El usuario es obligatorio",
                      valueAsNumber: true,
                      validate: (v) => v > 0 || "Selecciona un usuario válido",
                    })}
                  >
                    <option value="">Selecciona un usuario...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nombre} - {user.email}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="usuarioId" className="text-primary fw-semibold">
                    <i className="bi bi-person me-2"></i>
                    Usuario que solicita el préstamo
                  </label>
                  {errors.usuarioId && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.usuarioId.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12">
                <div className="form-floating">
                  <select
                    className={`form-select ${errors.libroId ? 'is-invalid' : ''}`}
                    id="libroId"
                    {...register("libroId", {
                      required: "El libro es obligatorio",
                      valueAsNumber: true,
                      validate: (v) => v > 0 || "Selecciona un libro válido",
                    })}
                  >
                    <option value="">Selecciona un libro disponible...</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.titulo} - {book.autorNombre}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="libroId" className="text-primary fw-semibold">
                    <BookOpen size={16} className="me-2" />
                    Libro a prestar
                  </label>
                  {errors.libroId && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.libroId.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="alert alert-info mt-3" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Información:</strong> La fecha de devolución se registrará automáticamente cuando el libro sea devuelto.
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
              <div className="text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                Todos los campos son obligatorios para crear el préstamo
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
                      Creando Préstamo...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Crear Préstamo
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
