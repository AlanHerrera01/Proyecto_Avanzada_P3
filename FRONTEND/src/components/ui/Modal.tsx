import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(139, 115, 85, 0.25)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered animate__animated animate__fadeInDown" style={{ maxWidth: 550 }}>
        <div className="modal-content shadow-2xl border-0 rounded-4" style={{ 
          animation: 'modalPop .4s cubic-bezier(.4,2,.6,1)', 
          background: 'linear-gradient(135deg, #fefefe 0%, #f8f5f0 50%, #f5f0e6 100%)',
          border: '2px solid rgba(139, 115, 85, 0.2)'
        }}>
          <div className="modal-header bg-gradient text-white rounded-top-4 d-flex align-items-center justify-content-between px-4 py-3" style={{ 
            background: 'linear-gradient(135deg, #8b7355 0%, #a0826d 50%, #b8956a 100%)', 
            boxShadow: '0 4px 20px 0 rgba(139, 115, 85, 0.3)' 
          }}>
            <h2 className="modal-title fs-4 fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>{title}</h2>
            <button type="button" className="btn-close btn-close-white ms-2" aria-label="Cerrar" onClick={onClose}></button>
          </div>
          <div className="modal-body px-5 py-4" style={{ minHeight: 200, background: 'rgba(255, 255, 255, 0.9)' }}>
            <div style={{ maxWidth: 450, margin: '0 auto' }}>
              {children}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalPop {
          0% { transform: scale(0.85) translateY(-40px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .modal-content input, .modal-content select {
          border-radius: 0.8rem !important;
          box-shadow: 0 2px 12px 0 rgba(139, 115, 85, 0.15);
          border: 2px solid rgba(139, 115, 85, 0.3);
          margin-bottom: 0.8rem;
          background: rgba(255, 255, 255, 0.95);
          transition: all 0.3s ease;
        }
        .modal-content input:focus, .modal-content select:focus {
          border-color: #8b7355;
          box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.2);
          background: white;
        }
        .modal-content label {
          font-weight: 600;
          color: #5d4e37;
          margin-bottom: 0.4rem;
          font-size: 0.95rem;
        }
        .modal-content .invalid-feedback {
          color: #d32f2f;
          font-size: 0.97em;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.4em;
        }
        .modal-content .invalid-feedback svg {
          width: 1.1em;
          height: 1.1em;
          min-width: 1.1em;
          min-height: 1.1em;
          margin-right: 0.2em;
          color: #d32f2f;
        }
        .modal-content .btn {
          min-width: 120px;
          font-weight: 600;
          border-radius: 0.8rem;
          box-shadow: 0 3px 12px 0 rgba(139, 115, 85, 0.25);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        .modal-content .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(139, 115, 85, 0.35);
        }
        .modal-content .btn-primary {
          background: linear-gradient(135deg, #8b7355 0%, #a0826d 100%);
          border-color: #8b7355;
        }
        .modal-content .btn-secondary {
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
          border-color: #6c757d;
        }
        .modal-content .btn + .btn {
          margin-left: 0.5rem;
        }
        .modal-content form {
          margin-bottom: 0;
        }
        .modal-content .mb-3 {
          margin-bottom: 1.1rem !important;
        }
      `}</style>
    </div>
  );
};
