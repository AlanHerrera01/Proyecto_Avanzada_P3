import { Observable, from, throwError } from 'rxjs';
import { map, catchError, timeout, retry, delay } from 'rxjs/operators';
import api from './api';
import { eventBus } from './eventBus';

// Configuración para operaciones reactivas
interface ReactiveApiConfig {
  timeoutMs: number;
  maxRetries: number;
  delayMs: number;
  enableMetrics: boolean;
}

const defaultConfig: ReactiveApiConfig = {
  timeoutMs: 5000,
  maxRetries: 3,
  delayMs: 100,
  enableMetrics: true
};

// Clase base para API reactiva
export class ReactiveApiService {
  private config: ReactiveApiConfig;

  constructor(config: Partial<ReactiveApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Convertir llamada API a Observable reactivo
  private createObservable<T>(promise: Promise<T>, operation: string): Observable<T> {
    return from(promise).pipe(
      delay(this.config.delayMs), // Simular procesamiento asíncrono
      timeout(this.config.timeoutMs),
      retry(this.config.maxRetries),
      map(response => {
        if (this.config.enableMetrics) {
          eventBus.publishSystemEvent(
            `Operación ${operation} completada`,
            'info',
            { operation, timestamp: Date.now() }
          );
        }
        return response;
      }),
      catchError(error => {
        eventBus.publishSystemEvent(
          `Error en operación ${operation}`,
          'error',
          { operation, error: error.message, timestamp: Date.now() }
        );
        return throwError(() => error);
      })
    );
  }

  // Métodos reactivos para préstamos
  getLoansReactive(): Observable<unknown[]> {
    return this.createObservable(
      api.get('/loans').then(response => response.data),
      'GET_LOANS'
    );
  }

  createLoanReactive(data: unknown): Observable<unknown> {
    const observable = this.createObservable(
      api.post('/loans', data).then(response => response.data),
      'CREATE_LOAN'
    );

    // Publicar evento de préstamo creado
    observable.subscribe({
      next: (loan) => {
        const loanData = loan as { id: number; usuarioId: number; libroId: number };
        eventBus.publishLoanEvent('LOAN_CREATED', {
          loanId: loanData.id,
          userId: loanData.usuarioId,
          bookId: loanData.libroId
        });
      }
    });

    return observable;
  }

  returnLoanReactive(id: number): Observable<unknown> {
    const observable = this.createObservable(
      api.post(`/loans/${id}/return`).then(response => response.data),
      'RETURN_LOAN'
    );

    // Publicar evento de préstamo devuelto
    observable.subscribe({
      next: (loan) => {
        const loanData = loan as { id: number; usuarioId: number; libroId: number };
        eventBus.publishLoanEvent('LOAN_RETURNED', {
          loanId: loanData.id,
          userId: loanData.usuarioId,
          bookId: loanData.libroId
        });
      }
    });

    return observable;
  }

  // Métodos reactivos para usuarios
  getUsersReactive(): Observable<unknown[]> {
    return this.createObservable(
      api.get('/users').then(response => response.data),
      'GET_USERS'
    );
  }

  // Métodos reactivos para libros
  getBooksReactive(): Observable<unknown[]> {
    return this.createObservable(
      api.get('/books').then(response => response.data),
      'GET_BOOKS'
    );
  }

  // Actualizar configuración
  updateConfig(newConfig: Partial<ReactiveApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): ReactiveApiConfig {
    return { ...this.config };
  }
}

// Instancia global del servicio reactivo
export const reactiveApi = new ReactiveApiService();

// Hook para usar la API reactiva con procesamiento en lotes
export function useBatchedApi<T>(
  apiCall: () => Observable<T[]>
) {
  return (new Observable<T[]>(subscriber => {
    let processed = 0;
    let allData: T[] = [];

    const subscription = apiCall().subscribe({
      next: (batch) => {
        allData = [...allData, ...batch];
        processed += batch.length;

        // Publicar métricas de procesamiento
        eventBus.publishSystemEvent(
          `Procesando lote de ${batch.length} elementos`,
          'info',
          { 
            batchSize: batch.length,
            totalProcessed: processed,
            timestamp: Date.now()
          }
        );

        // Simular procesamiento por lotes como en el backend
        setTimeout(() => {
          subscriber.next(allData);
        }, 1000);
      },
      error: (error) => {
        eventBus.publishSystemEvent(
          'Error en procesamiento por lotes',
          'error',
          { error: error.message, processed }
        );
        subscriber.error(error);
      },
      complete: () => {
        eventBus.publishSystemEvent(
          'Procesamiento por lotes completado',
          'info',
          { totalItems: allData.length, processed }
        );
        subscriber.complete();
      }
    });

    return () => subscription.unsubscribe();
  }));
}
