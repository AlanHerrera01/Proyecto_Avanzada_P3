import React, { useEffect, useRef, useCallback } from 'react';
import { Subscription, Observable } from 'rxjs';
import { eventBus, type Event, type EventBusConfig } from '../services/eventBus';

// =======================
// Tipos de eventos
// =======================

// Eventos de libros
type BookEventType = 'BOOK_CREATED' | 'BOOK_UPDATED' | 'BOOK_DELETED';

type BookEventPayload = {
  bookId: number;
};

// ✅ Eventos de autores (igual a Loan/Book)
type AuthorEventType = 'AUTHOR_CREATED' | 'AUTHOR_UPDATED' | 'AUTHOR_DELETED';

type AuthorEventPayload = {
  authorId: number;
  nombre?: string;
  nacionalidad?: string;
};

// =======================
// Hook para suscribirse a eventos del EventBus
// =======================

export function useEventBus<T extends Event>(
    eventType: string,
    callback: (event: T) => void
) {
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    // Suscribirse al evento específico
    subscriptionRef.current = eventBus.subscribe<T>(eventType, callback);

    // Cleanup al desmontar
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [eventType, callback]);
}

// =======================
// Hook para obtener métricas del sistema en tiempo real
// =======================

export function useSystemMetrics() {
  const [metrics, setMetrics] = React.useState({
    processed: 0,
    errors: 0,
    lastUpdate: 0
  });

  useEffect(() => {
    const subscription = eventBus.getSystemMetrics$().subscribe({
      next: (newMetrics) => {
        setMetrics(newMetrics);
      },
      error: (error) => {
        console.error('[useSystemMetrics] Error obteniendo métricas:', error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return metrics;
}

// =======================
// Hook para publicar eventos con memoización
// =======================

export function useEventPublisher() {
  // Publicador genérico
  const publishCallback = useCallback(<T extends Event>(
      event: Omit<T, 'timestamp' | 'id'>
  ) => {
    eventBus.publish(event);
  }, []);

  // Publicar eventos de préstamos
  const publishLoanEvent = useCallback((
      type: 'LOAN_CREATED' | 'LOAN_RETURNED' | 'LOAN_ANALYSIS_STARTED' | 'LOAN_ANALYSIS_COMPLETED',
      payload: {
        loanId?: number;
        userId?: number;
        bookId?: number;
        metrics?: {
          processed: number;
          errors: number;
          batch: number;
        };
      }
  ) => {
    eventBus.publishLoanEvent(type, payload);
  }, []);

  // Publicar eventos de libros
  const publishBookEvent = useCallback((
      type: BookEventType,
      payload: BookEventPayload
  ) => {
    eventBus.publish({
      type,
      payload
    });
  }, []);

  // ✅ Publicar eventos de autores (IGUAL al patrón de Loan)
  const publishAuthorEvent = useCallback((
      type: AuthorEventType,
      payload: AuthorEventPayload
  ) => {
    eventBus.publish({
      type,
      payload
    });
  }, []);

  // Publicar eventos del sistema
  const publishSystemEvent = useCallback((
      message: string,
      level: 'info' | 'warning' | 'error',
      data?: unknown
  ) => {
    eventBus.publishSystemEvent(message, level, data);
  }, []);

  return {
    publish: publishCallback,
    publishLoanEvent,
    publishBookEvent,
    publishAuthorEvent, // ✅ lo exponemos
    publishSystemEvent
  };
}

// =======================
// Hook para configuración del EventBus
// =======================

export function useEventBusConfig() {
  const getConfig = useCallback(() => eventBus.getConfig(), []);

  const updateConfig = useCallback((config: Partial<EventBusConfig>) => {
    eventBus.updateConfig(config);
  }, []);

  return { getConfig, updateConfig };
}

// =======================
// Hook genérico para suscripciones reactivas
// =======================

export function useReactiveSubscription<T>(
    observable$: Observable<T>,
    callback: (value: T) => void
) {
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    subscriptionRef.current = observable$.subscribe(callback);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [observable$, callback]);
}
