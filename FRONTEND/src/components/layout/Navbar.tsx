
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, UserCircle, FileText, Library, Home, Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-lg sticky-top" style={{
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center fw-bold" to="/">
          <div className="bg-white rounded-xl p-2 d-flex align-items-center justify-content-center shadow-lg" style={{height:48, width:48}}>
            <Library size={32} className="text-primary" />
          </div>
          <div className="ms-3">
            <div className="text-white fs-4">Biblioteca Virtual</div>
            <div className="text-white-50 small">Sistema Reactivo</div>
          </div>
        </Link>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link d-flex align-items-center fw-semibold px-4 py-2 rounded-pill transition-all ${
                  isActive('/') 
                    ? 'active bg-white text-dark shadow-lg border border-primary' 
                    : 'text-white hover:bg-white hover:bg-opacity-25 hover:shadow-md'
                }`}
              >
                <Home size={20} className="me-2" />
                <span>Inicio</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/users" 
                className={`nav-link d-flex align-items-center fw-semibold px-4 py-2 rounded-pill transition-all ${
                  isActive('/users') 
                    ? 'active bg-white text-dark shadow-lg border border-primary' 
                    : 'text-white hover:bg-white hover:bg-opacity-25 hover:shadow-md'
                }`}
              >
                <UserCircle size={20} className="me-2" />
                <span>Usuarios</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/authors" 
                className={`nav-link d-flex align-items-center fw-semibold px-4 py-2 rounded-pill transition-all ${
                  isActive('/authors') 
                    ? 'active bg-white text-dark shadow-lg border border-primary' 
                    : 'text-white hover:bg-white hover:bg-opacity-25 hover:shadow-md'
                }`}
              >
                <Users size={20} className="me-2" />
                <span>Autores</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/books" 
                className={`nav-link d-flex align-items-center fw-semibold px-4 py-2 rounded-pill transition-all ${
                  isActive('/books') 
                    ? 'active bg-white text-dark shadow-lg border border-primary' 
                    : 'text-white hover:bg-white hover:bg-opacity-25 hover:shadow-md'
                }`}
              >
                <BookOpen size={20} className="me-2" />
                <span>Libros</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/loans" 
                className={`nav-link d-flex align-items-center fw-semibold px-4 py-2 rounded-pill transition-all ${
                  isActive('/loans') 
                    ? 'active bg-white text-dark shadow-lg border border-primary' 
                    : 'text-white hover:bg-white hover:bg-opacity-25 hover:shadow-md'
                }`}
              >
                <FileText size={20} className="me-2" />
                <span>Préstamos</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/metrics" 
                className={`nav-link d-flex align-items-center fw-semibold px-4 py-2 rounded-pill transition-all ${
                  isActive('/metrics') 
                    ? 'active bg-white text-dark shadow-lg border border-primary' 
                    : 'text-white hover:bg-white hover:bg-opacity-25 hover:shadow-md'
                }`}
              >
                <Activity size={20} className="me-2" />
                <span>Métricas</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
