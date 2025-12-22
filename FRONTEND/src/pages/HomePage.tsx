import React from 'react';
import { Link } from 'react-router-dom';
import { Library, BookOpen, Users, FileText, Activity, Sparkles, TrendingUp, Zap } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center" 
         style={{
           background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 25%, #e9ecef 50%, #dee2e6 100%)',
           paddingTop: '5rem'
         }}>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Hero Section */}
            <div className="text-center mb-5">
              <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-lg" 
                   style={{width: 120, height: 120}}>
                <Library size={64} className="text-primary" />
              </div>
              <h1 className="display-3 fw-bold text-dark mb-3">
                Biblioteca Virtual Reactiva
              </h1>
              <p className="lead text-muted mb-4">
                Gestión moderna con eventos en tiempo real y métricas avanzadas
              </p>
            </div>

            {/* Feature Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-3">
                <div className="card bg-white border-0 shadow-lg h-100 transform hover:scale-105 transition-all hover:shadow-xl">
                  <div className="card-body text-center p-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{width: 60, height: 60}}>
                      <Users size={28} className="text-primary" />
                    </div>
                    <h5 className="fw-bold text-dark">Usuarios</h5>
                    <p className="text-muted small mb-3">Gestión completa de usuarios y perfiles</p>
                    <Link to="/users" className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-semibold shadow hover:shadow-lg transition-all">
                      Administrar
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card bg-white border-0 shadow-lg h-100 transform hover:scale-105 transition-all hover:shadow-xl">
                  <div className="card-body text-center p-4">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{width: 60, height: 60}}>
                      <BookOpen size={28} className="text-success" />
                    </div>
                    <h5 className="fw-bold text-dark">Libros</h5>
                    <p className="text-muted small mb-3">Catálogo completo con autores</p>
                    <Link to="/books" className="btn btn-success btn-sm rounded-pill px-4 py-2 fw-semibold shadow hover:shadow-lg transition-all">
                      Explorar
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card bg-white border-0 shadow-lg h-100 transform hover:scale-105 transition-all hover:shadow-xl">
                  <div className="card-body text-center p-4">
                    <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{width: 60, height: 60}}>
                      <FileText size={28} className="text-warning" />
                    </div>
                    <h5 className="fw-bold text-dark">Préstamos</h5>
                    <p className="text-muted small mb-3">Sistema con actualizaciones en vivo</p>
                    <Link to="/loans" className="btn btn-warning btn-sm rounded-pill px-4 py-2 fw-semibold shadow hover:shadow-lg transition-all">
                      Gestionar
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card bg-white border-0 shadow-lg h-100 transform hover:scale-105 transition-all hover:shadow-xl">
                  <div className="card-body text-center p-4">
                    <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{width: 60, height: 60}}>
                      <Activity size={28} className="text-info" />
                    </div>
                    <h5 className="fw-bold text-dark">Métricas</h5>
                    <p className="text-muted small mb-3">Análisis en tiempo real</p>
                    <Link to="/metrics" className="btn btn-info btn-sm rounded-pill px-4 py-2 fw-semibold shadow hover:shadow-lg transition-all">
                      Ver Estadísticas
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="bg-white border-0 shadow-lg rounded-3 p-4 text-center">
                  <Zap className="text-warning mb-2" size={32} />
                  <h3 className="text-dark fw-bold mb-1">Tiempo Real</h3>
                  <p className="text-muted small">Actualizaciones instantáneas</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-white border-0 shadow-lg rounded-3 p-4 text-center">
                  <Sparkles className="text-info mb-2" size={32} />
                  <h3 className="text-dark fw-bold mb-1">Reactivo</h3>
                  <p className="text-muted small">Arquitectura moderna</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-white border-0 shadow-lg rounded-3 p-4 text-center">
                  <TrendingUp className="text-success mb-2" size={32} />
                  <h3 className="text-dark fw-bold mb-1">Métricas</h3>
                  <p className="text-muted small">Análisis avanzado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
