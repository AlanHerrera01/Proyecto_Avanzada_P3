import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, bufferTime } from 'rxjs/operators';

// Tipos de eventos del sistema
export interface Event {
  type: string;
  payload?: unknown;
  timestamp: number;
  id: string;
}

export interface LoanEvent extends Event {
  type: 'LOAN_CREATED' | 'LOAN_RETURNED' | 'LOAN_ANALYSIS_STARTED' | 'LOAN_ANALYSIS_COMPLETED';
  payload: {
    loanId?: number;
    userId?: number;
    bookId?: number;
    metrics?: {
      processed: number;
      errors: number;
      batch: number;
    };
  };
}

export interface SystemEvent extends Event {
  type: 'SYSTEM_METRICS' | 'SYSTEM_ERROR' | 'SYSTEM_WARNING';
  payload: {
    message: string;
    level: 'info' | 'warning' | 'error';
    data?: unknown;
  };
}

// Configuración del EventBus
export interface EventBusConfig {
  batchSize: number;
  bufferTimeMs: number;
  timeoutMs: number;
  maxRetries: number;
}

export class EventBus {
  private static instance: EventBus;
  private events$ = new Subject<Event>();
  private systemMetrics$ = new BehaviorSubject<{
    processed: number;
    errors: number;
    lastUpdate: number;
  }>({ processed: 0, errors: 0, lastUpdate: Date.now() });
  
  private subscriptions = new Map<string, Subscription>();
  private config: EventBusConfig;

  private constructor() {
    this.config = {
      batchSize: parseInt(import.meta.env.VITE_EVENT_BATCH_SIZE || '10'),
      bufferTimeMs: parseInt(import.meta.env.VITE_EVENT_BUFFER_TIME || '1000'),
      timeoutMs: parseInt(import.meta.env.VITE_EVENT_TIMEOUT || '5000'),
      maxRetries: parseInt(import.meta.env.VITE_EVENT_MAX_RETRIES || '3')
    };

    // Procesamiento reactivo de eventos con backpressure
    this.setupReactiveProcessing();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  private setupReactiveProcessing() {
    // Configurar procesamiento por lotes
    this.setupBatchProcessing();
  }

  private setupBatchProcessing() {
    this.events$.pipe(
      bufferTime(this.config.bufferTimeMs),
      filter(events => events.length > 0)
    ).subscribe({
      next: (events) => {
        const typedEvents = events as Event[];
        this.processBatch(typedEvents);
      },
      error: (error) => {
        console.error('[EventBus] Error en procesamiento por lotes:', error);
        // Actualizar métricas de error
        const currentMetrics = this.systemMetrics$.value;
        this.systemMetrics$.next({
          ...currentMetrics,
          errors: currentMetrics.errors + 1,
          lastUpdate: Date.now()
        });
      }
    });
  }

  private processBatch(events: Event[]) {
    let processed = 0;
    let errors = 0;

    events.forEach(event => {
      try {
        // Procesamiento individual del evento
        this.processEvent(event);
        processed++;
      } catch (error) {
        console.error(`[EventBus] Error procesando evento ${event.id}:`, error);
        errors++;
      }
    });

    // Actualizar métricas
    const currentMetrics = this.systemMetrics$.value;
    this.systemMetrics$.next({
      processed: currentMetrics.processed + processed,
      errors: currentMetrics.errors + errors,
      lastUpdate: Date.now()
    });
  }

  private processEvent(event: Event) {
    // Lógica específica según el tipo de evento
    switch (event.type) {
      case 'LOAN_CREATED':
      case 'LOAN_RETURNED':
        console.log(`[EventBus] Evento de préstamo: ${event.type}`, event.payload);
        break;
      case 'SYSTEM_METRICS':
        console.log(`[EventBus] Métricas del sistema:`, event.payload);
        break;
    }
  }

  // Publicar eventos
  publish<T extends Event>(event: Omit<T, 'timestamp' | 'id'>): void {
    const fullEvent: T = {
      ...event as T,
      timestamp: Date.now(),
      id: this.generateEventId()
    };
    
    this.events$.next(fullEvent);
  }

  // Suscribirse a eventos específicos
  subscribe<T extends Event>(
    eventType: string,
    callback: (event: T) => void
  ): Subscription {
    const subscription = this.events$.pipe(
      filter(event => event.type === eventType),
      map(event => event as T)
    ).subscribe(callback);

    const subscriptionId = `${eventType}_${Date.now()}`;
    this.subscriptions.set(subscriptionId, subscription);

    return subscription;
  }

  // Suscribirse a métricas del sistema
  getSystemMetrics$(): Observable<typeof this.systemMetrics$.value> {
    return this.systemMetrics$.asObservable();
  }

  // Publicar eventos de sistema
  publishSystemEvent(message: string, level: 'info' | 'warning' | 'error', data?: unknown): void {
    this.publish<SystemEvent>({
      type: 'SYSTEM_METRICS',
      payload: { message, level, data }
    });
  }

  // Publicar eventos de préstamos
  publishLoanEvent(type: LoanEvent['type'], payload: LoanEvent['payload']): void {
    this.publish<LoanEvent>({
      type,
      payload
    });
  }

  // Limpiar suscripciones
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  // Limpiar todas las suscripciones
  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.clear();
  }

  private generateEventId(): string {
    return `evt_${performance.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configuración dinámica
  updateConfig(newConfig: Partial<EventBusConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[EventBus] Configuración actualizada:', this.config);
  }

  getConfig(): EventBusConfig {
    return { ...this.config };
  }
}

// Instancia global del EventBus
export const eventBus = EventBus.getInstance();
