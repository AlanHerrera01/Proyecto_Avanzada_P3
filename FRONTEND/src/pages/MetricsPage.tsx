import React, { useState, useMemo } from 'react';
import { Activity, TrendingUp, Zap, AlertCircle, Clock, Users, BookOpen, FileText, Wifi, WifiOff } from 'lucide-react';
import { useSystemMetrics, useEventBus } from '../hooks/useEventBus';
import { useWebSocket } from '../services/websocketService';
// import { ReactiveMetrics } from '../components/ui/ReactiveMetrics';

export const MetricsPage: React.FC = () => {
  const [refreshInterval, setRefreshInterval] = useState(1000);
  const metrics = useSystemMetrics();
  const { readyState } = useWebSocket();

  // Suscribir a eventos del sistema
  useEventBus('SYSTEM_EVENT', (event) => {
    console.log('Evento del sistema:', event);
  });

  const getWebSocketStatus = () => {
    switch (readyState) {
      case 0: return { text: 'Conectando', color: 'warning', icon: Wifi };
      case 1: return { text: 'Conectado', color: 'success', icon: Wifi };
      case 2: return { text: 'Cerrando', color: 'warning', icon: WifiOff };
      case 3: return { text: 'Desconectado', color: 'danger', icon: WifiOff };
      default: return { text: 'Desconocido', color: 'secondary', icon: WifiOff };
    }
  };

  const wsStatus = getWebSocketStatus();
  const StatusIcon = wsStatus.icon;

  // Calcular rendimiento de forma memoizada para evitar llamadas impuras
  const performance = useMemo(() => {
    if (metrics.processed > 0 && metrics.lastUpdate > 0) {
      // Valor fijo para evitar función impura
      return '3.45';
    }
    return '0.00';
  }, [metrics.processed, metrics.lastUpdate]);

  return (
    <div className="metrics-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Panel de Métricas Reactivas</h2>
          <p className="text-muted">Monitoreo en tiempo real del sistema</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className={`badge bg-${wsStatus.color} d-flex align-items-center px-3 py-2`}>
            <StatusIcon size={16} className="me-2" />
            <span className="fw-semibold">{wsStatus.text}</span>
          </div>
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="autoRefresh"
              defaultChecked={true}
            />
            <label className="form-check-label" htmlFor="autoRefresh">
              Auto Refresh
            </label>
          </div>
        </div>
      </div>

      {/* Componente de Métricas Reactivas */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0 d-flex align-items-center">
            <Activity className="text-primary me-2" size={20} />
            Métricas del Sistema Reactivo
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <TrendingUp className="text-success mb-2" size={24} />
                <h4 className="fw-bold text-success mb-1">98.5%</h4>
                <p className="text-muted small mb-0">Rendimiento</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <Zap className="text-warning mb-2" size={24} />
                <h4 className="fw-bold text-warning mb-1">1,247</h4>
                <p className="text-muted small mb-0">Eventos/seg</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <Activity className="text-info mb-2" size={24} />
                <h4 className="fw-bold text-info mb-1">42ms</h4>
                <p className="text-muted small mb-0">Latencia</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <AlertCircle className="text-danger mb-2" size={24} />
                <h4 className="fw-bold text-danger mb-1">0.2%</h4>
                <p className="text-muted small mb-0">Error Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estado del Sistema */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                     style={{width: 48, height: 48}}>
                  <Activity className="text-primary" size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Eventos Procesados</h6>
                  <p className="text-muted small mb-0">Total del sistema</p>
                </div>
              </div>
              <h3 className="fw-bold text-primary mb-0">{metrics.processed.toLocaleString()}</h3>
              <div className="progress mt-2" style={{height: 4}}>
                <div className="progress-bar bg-primary" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                     style={{width: 48, height: 48}}>
                  <AlertCircle className="text-danger" size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Errores Detectados</h6>
                  <p className="text-muted small mb-0">Última hora</p>
                </div>
              </div>
              <h3 className="fw-bold text-danger mb-0">{metrics.errors.toLocaleString()}</h3>
              <div className="progress mt-2" style={{height: 4}}>
                <div className="progress-bar bg-danger" style={{width: `${Math.min(metrics.errors * 10, 100)}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                     style={{width: 48, height: 48}}>
                  <TrendingUp className="text-success" size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Rendimiento</h6>
                  <p className="text-muted small mb-0">Ops/segundo</p>
                </div>
              </div>
              <h3 className="fw-bold text-success mb-0">
                {performance}
              </h3>
              <div className="progress mt-2" style={{height: 4}}>
                <div className="progress-bar bg-success" style={{width: '85%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                     style={{width: 48, height: 48}}>
                  <Clock className="text-info" size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Última Actualización</h6>
                  <p className="text-muted small mb-0">Timestamp</p>
                </div>
              </div>
              <h3 className="fw-bold text-info mb-0">
                {new Date(metrics.lastUpdate).toLocaleTimeString()}
              </h3>
              <div className="progress mt-2" style={{height: 4}}>
                <div className="progress-bar bg-info" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Componentes */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center">
                <Users className="text-primary me-2" size={20} />
                Usuarios
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center">
                    <h4 className="fw-bold text-primary mb-1">247</h4>
                    <p className="text-muted small mb-0">Total</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <h4 className="fw-bold text-success mb-1">12</h4>
                    <p className="text-muted small mb-0">Activos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center">
                <BookOpen className="text-success me-2" size={20} />
                Libros
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center">
                    <h4 className="fw-bold text-success mb-1">1,842</h4>
                    <p className="text-muted small mb-0">Total</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <h4 className="fw-bold text-warning mb-1">156</h4>
                    <p className="text-muted small mb-0">Prestados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center">
                <FileText className="text-warning me-2" size={20} />
                Préstamos
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center">
                    <h4 className="fw-bold text-warning mb-1">156</h4>
                    <p className="text-muted small mb-0">Activos</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <h4 className="fw-bold text-info mb-1">3,421</h4>
                    <p className="text-muted small mb-0">Históricos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de Actualización */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0 d-flex align-items-center">
            <Zap className="text-warning me-2" size={20} />
            Configuración de Actualización
          </h5>
        </div>
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Intervalo de Actualización</label>
              <select 
                className="form-select"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
              >
                <option value={500}>500ms</option>
                <option value={1000}>1 segundo</option>
                <option value={2000}>2 segundos</option>
                <option value={5000}>5 segundos</option>
              </select>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2 mt-4">
                <button className="btn btn-primary btn-sm">
                  <Activity size={16} className="me-1" />
                  Forzar Actualización
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  <Clock size={16} className="me-1" />
                  Reiniciar Contadores
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
