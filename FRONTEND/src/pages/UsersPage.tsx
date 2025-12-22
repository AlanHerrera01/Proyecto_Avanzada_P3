import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, UserCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { userService } from '../services/userService';
import type { User, UserFormData } from '../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setError(null);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);
      if (editingUser) {
        await userService.update(editingUser.id, data);
      } else {
        await userService.create(data);
      }
      await loadUsers();
      handleCloseModal();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      setLoading(true);
      await userService.delete(id);
      await loadUsers();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset({ nombre: '', email: '' });
  };

  return (
    <div className="min-vh-100 py-5">
      <div className="container">
        <div className="bg-white rounded-4 shadow-lg px-5 py-4 mb-5 d-flex flex-column flex-md-row align-items-md-center justify-content-md-between border border-primary border-opacity-20">
          <div>
            <h1 className="display-4 fw-bold mb-1 text-primary">Usuarios</h1>
            <p className="text-secondary mb-0 fs-5">Administra los miembros de tu biblioteca</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn btn-primary d-flex align-items-center px-4 py-2 fs-5 shadow-lg rounded-pill hover:shadow-xl transition-all"
            style={{ minWidth: 200 }}
          >
            <Plus size={22} className="me-2" />
            Nuevo Usuario
          </button>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
            <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Error:"><use xlinkHref="#exclamation-triangle-fill" /></svg>
            <span>{error}</span>
          </div>
        )}

        {loading && users.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-secondary fs-5 fw-semibold">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-lg">
            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{width: '100px', height: '100px'}}>
              <UserCircle size={50} className="text-primary" />
            </div>
            <p className="text-secondary fs-4 fw-bold mb-2">No hay usuarios registrados</p>
            <p className="text-muted fs-6 mb-4">Comienza agregando tu primer usuario</p>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="btn btn-primary rounded-pill px-4 py-2 shadow hover:shadow-lg transition-all"
            >
              <Plus size={20} className="me-2" />
              Agregar Primer Usuario
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {users.map((user) => (
              <div key={user.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-lg border-0 rounded-3 hover:shadow-xl transition-all">
                  <div className="card-header bg-primary bg-opacity-10 d-flex align-items-center justify-content-center rounded-top-3" style={{height: '100px'}}>
                    <UserCircle size={45} className="text-primary" />
                  </div>
                  <div className="card-body d-flex flex-column justify-content-between p-4">
                    <div>
                      <h5 className="card-title fw-bold text-dark mb-2 text-truncate fs-5">{user.nombre}</h5>
                      <p className="card-text text-secondary mb-3 text-truncate small">{user.email}</p>
                    </div>
                    <div className="d-flex justify-content-end gap-2 mt-auto">
                      <button 
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 d-flex align-items-center hover:shadow-md transition-all"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit2 size={14} className="me-1" />
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 d-flex align-items-center hover:shadow-md transition-all"
                        onClick={() => handleDelete(user.id)}
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
          title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <UserCircle size={40} className="text-primary" />
              </div>
              <h4 className="text-primary fw-bold mb-2">
                {editingUser ? "Editando Información del Usuario" : "Agregando Nuevo Usuario"}
              </h4>
              <p className="text-muted">
                {editingUser ? "Modifica los datos del usuario seleccionado" : "Completa los datos para registrar un nuevo usuario en la biblioteca"}
              </p>
            </div>

            <div className="row g-3">
              <div className="col-12">
                <div className="form-floating">
                  <input
                    type="text"
                    className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                    id="nombre"
                    placeholder="Nombre completo"
                    {...register('nombre', { 
                      required: 'El nombre es obligatorio',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                    })}
                  />
                  <label htmlFor="nombre" className="text-primary fw-semibold">
                    <UserCircle size={16} className="me-2" />
                    Nombre Completo
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
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    placeholder="Correo electrónico"
                    {...register('email', { 
                      required: 'El email es obligatorio',
                      pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' }
                    })}
                  />
                  <label htmlFor="email" className="text-primary fw-semibold">
                    <i className="bi bi-envelope me-2"></i>
                    Correo Electrónico
                  </label>
                  {errors.email && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.email.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
              <div className="text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                {editingUser ? "Los cambios se guardarán al hacer clic en Actualizar" : "Todos los campos son obligatorios"}
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
                  ) : editingUser ? (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Actualizar Usuario
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Crear Usuario
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
