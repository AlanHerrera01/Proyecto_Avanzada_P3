import React from 'react';
import { Subject, Observable, Subscription } from 'rxjs';
import { filter, map, retry, timeout } from 'rxjs/operators';
import { eventBus, type LoanEvent, type SystemEvent } from './eventBus';

// Configuración del WebSocket
interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  timeoutMs: number;
}

interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  id: string;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private messages$ = new Subject<WebSocketMessage>();
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private subscriptions = new Map<string, Subscription>();

  private constructor() {
    this.config = {
      url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      timeoutMs: 10000
    };
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] Conectado exitosamente');
          this.reconnectAttempts = 0;
          this.setupMessageHandling();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.messages$.next(message);
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocket] Conexión cerrada:', event.code, event.reason);
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          eventBus.publishSystemEvent(
            'Error de conexión WebSocket',
            'error',
            { error }
          );
          reject(error);
        };

        // Timeout para la conexión
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('Timeout de conexión WebSocket'));
          }
        }, this.config.timeoutMs);

      } catch (error) {
        reject(error);
      }
    });
  }

  private setupMessageHandling() {
    // Procesar mensajes y reenviar al EventBus
    this.messages$.pipe(
      filter(msg => msg.type.startsWith('LOAN_')),
      map(msg => msg as LoanEvent)
    ).subscribe({
      next: (loanEvent) => {
        eventBus.publishLoanEvent(loanEvent.type, loanEvent.payload);
      },
      error: (error) => {
        console.error('[WebSocket] Error procesando evento de préstamo:', error);
      }
    });

    this.messages$.pipe(
      filter(msg => msg.type.startsWith('SYSTEM_')),
      map(msg => msg as SystemEvent)
    ).subscribe({
      next: (systemEvent) => {
        eventBus.publishSystemEvent(
          systemEvent.payload.message,
          systemEvent.payload.level,
          systemEvent.payload.data
        );
      },
      error: (error) => {
        console.error('[WebSocket] Error procesando evento de sistema:', error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Intentando reconectar (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(error => {
          console.error('[WebSocket] Error en reconexión:', error);
        });
      }, this.config.reconnectInterval);
    } else {
      console.error('[WebSocket] Máximo de intentos de reconexión alcanzado');
      eventBus.publishSystemEvent(
        'Sin conexión WebSocket - Máximo intentos alcanzado',
        'error',
        { attempts: this.reconnectAttempts }
      );
    }
  }

  // Enviar mensaje al servidor
  send(message: Omit<WebSocketMessage, 'timestamp' | 'id'>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: Date.now(),
        id: this.generateMessageId()
      };
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('[WebSocket] No conectado, no se puede enviar mensaje');
    }
  }

  // Suscribirse a mensajes específicos
  subscribe<T extends WebSocketMessage>(
    messageType: string,
    callback: (message: T) => void
  ): Subscription {
    const subscription = this.messages$.pipe(
      filter(msg => msg.type === messageType),
      map(msg => msg as T),
      retry(3),
      timeout(this.config.timeoutMs)
    ).subscribe(callback);

    const subscriptionId = `${messageType}_${Date.now()}`;
    this.subscriptions.set(subscriptionId, subscription);

    return subscription;
  }

  // Obtener observable de mensajes
  getMessages$(): Observable<WebSocketMessage> {
    return this.messages$.asObservable();
  }

  // Verificar estado de conexión
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Obtener estado de conexión
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  // Cerrar conexión
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.clear();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('[WebSocket] Desconectado');
  }

  // Actualizar configuración
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[WebSocket] Configuración actualizada:', this.config);
  }

  getConfig(): WebSocketConfig {
    return { ...this.config };
  }

  private generateMessageId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enviar eventos específicos
  sendLoanEvent(type: LoanEvent['type'], payload: LoanEvent['payload']): void {
    this.send({
      type,
      payload
    });
  }

  sendSystemEvent(message: string, level: 'info' | 'warning' | 'error', data?: unknown): void {
    this.send({
      type: 'SYSTEM_MESSAGE',
      payload: { message, level, data }
    });
  }
}

// Instancia global del WebSocket
export const webSocketService = WebSocketService.getInstance();

// Hook para usar WebSocket en componentes
export function useWebSocket() {
  const [isConnected, setIsConnected] = React.useState(false);
  const [readyState, setReadyState] = React.useState<number>(WebSocket.CLOSED);

  React.useEffect(() => {
    const checkConnection = () => {
      setIsConnected(webSocketService.isConnected());
      setReadyState(webSocketService.getReadyState());
    };

    // Verificar conexión inicial
    checkConnection();

    // Configurar intervalo para verificar estado
    const interval = setInterval(checkConnection, 1000);

    // Intentar conectar si no está conectado
    if (!webSocketService.isConnected()) {
      webSocketService.connect().catch(console.error);
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  const send = React.useCallback((message: Omit<WebSocketMessage, 'timestamp' | 'id'>) => {
    webSocketService.send(message);
  }, []);

  const sendLoanEvent = React.useCallback((type: LoanEvent['type'], payload: LoanEvent['payload']) => {
    webSocketService.sendLoanEvent(type, payload);
  }, []);

  const sendSystemEvent = React.useCallback((message: string, level: 'info' | 'warning' | 'error', data?: unknown) => {
    webSocketService.sendSystemEvent(message, level, data);
  }, []);

  const disconnect = React.useCallback(() => {
    webSocketService.disconnect();
  }, []);

  return {
    isConnected,
    readyState,
    send,
    sendLoanEvent,
    sendSystemEvent,
    disconnect
  };
}