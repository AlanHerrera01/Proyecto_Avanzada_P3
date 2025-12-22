import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 25%, #dee2e6 50%, #ced4da 100%)'
    }}>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white border-opacity-20">
          {children}
        </div>
      </main>
      
      {/* Footer Moderno */}
      <footer className="bg-gray-900 bg-opacity-90 backdrop-blur-lg border-t border-gray-700 mt-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-bold text-primary mb-3">Biblioteca Virtual Reactiva</h6>
              <p className="text-gray-300 small">
                Sistema moderno de gestión con eventos en tiempo real y arquitectura reactiva.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="text-gray-400 small mb-2">
                © 2025 Desarrollado con React + RxJS + TypeScript
              </p>
              <p className="text-gray-500 small">
                Powered by Reactive Architecture
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
