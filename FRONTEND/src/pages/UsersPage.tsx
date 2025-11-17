import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, UserCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { userService } from '../services/userService';
import type { User, UserFormData } from '../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar usuario');
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
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
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="bg-white rounded-4 shadow-sm px-4 py-4 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-md-between">
          <div>
            <h1 className="display-4 fw-bold mb-1" style={{ color: '#1565c0', letterSpacing: '-1px' }}>Usuarios</h1>
            <p className="text-secondary mb-0" style={{ fontSize: '1.1rem' }}>Administra los miembros de tu biblioteca</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="btn btn-primary d-flex align-items-center px-4 py-2 fs-5 shadow-sm"
            style={{ minWidth: 180 }}
          >
            <Plus size={22} className="me-2" />
            Nuevo Usuario
          </Button>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
            <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Error:"><use xlinkHref="#exclamation-triangle-fill" /></svg>
            <span>{error}</span>
          </div>
        )}

        {loading && users.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-secondary fw-semibold">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5">
            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width: '80px', height: '80px'}}>
              <UserCircle size={40} className="text-primary" />
            </div>
            <p className="text-secondary fs-5 fw-semibold">No hay usuarios registrados</p>
            <p className="text-muted">Comienza agregando tu primer usuario</p>
          </div>
        ) : (
          <div className="row g-4">
            {users.map((user) => (
              <div key={user.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm">
                  <div className="card-header bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{height: '90px'}}>
                    <UserCircle size={40} className="text-primary opacity-50" />
                  </div>
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title fw-bold text-dark mb-1 text-truncate">{user.nombre}</h5>
                      <p className="card-text text-secondary mb-2 text-truncate">{user.email}</p>
                    </div>
                    <div className="d-flex justify-content-end gap-2 mt-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(user)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
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
          title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <Input
                label="Nombre Completo"
                placeholder="Ingresa el nombre del usuario"
                {...register('nombre', { 
                  required: 'El nombre es obligatorio',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                })}
                error={errors.nombre?.message}
              />
            </div>
            <div className="mb-3">
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="usuario@ejemplo.com"
                {...register('email', { 
                  required: 'El email es obligatorio',
                  pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' }
                })}
                error={errors.email?.message}
              />
            </div>
            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
