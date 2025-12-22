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
        delay(this.config.delayMs),
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

  // =========================
  // === PRÉSTAMOS (LOANS) ===
  // =========================

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

  // ==================
  // === AUTORES ======
  // ==================

  getAuthorsReactive(): Observable<unknown[]> {
    return this.createObservable(
        api.get('/authors').then(r => r.data),
        'GET_AUTHORS'
    );
  }

  createAuthorReactive(data: unknown): Observable<unknown> {
    const observable = this.createObservable(
        api.post('/authors', data).then(r => r.data),
        'CREATE_AUTHOR'
    );

    // Igual al loan: subscribe interno + publicar evento
    observable.subscribe({
      next: (author) => {
        const authorData = author as { id: number; nombre?: string; nacionalidad?: string };
        // Si tu eventBus tiene publishAuthorEvent úsalo, si no, uso publish genérico:
        if ((eventBus as any).publishAuthorEvent) {
          (eventBus as any).publishAuthorEvent('AUTHOR_CREATED', {
            authorId: authorData.id,
            nombre: authorData.nombre,
            nacionalidad: authorData.nacionalidad
          });
        } else {
          eventBus.publish({
            type: 'AUTHOR_CREATED',
            payload: {
              authorId: authorData.id,
              nombre: authorData.nombre,
              nacionalidad: authorData.nacionalidad
            }
          });
        }
      }
    });

    return observable;
  }

  updateAuthorReactive(id: number, data: unknown): Observable<unknown> {
    const observable = this.createObservable(
        api.put(`/authors/${id}`, data).then(r => r.data),
        'UPDATE_AUTHOR'
    );

    observable.subscribe({
      next: (author) => {
        const authorData = author as { id?: number; nombre?: string; nacionalidad?: string };
        const authorId = authorData.id ?? id;

        if ((eventBus as any).publishAuthorEvent) {
          (eventBus as any).publishAuthorEvent('AUTHOR_UPDATED', {
            authorId,
            nombre: authorData.nombre,
            nacionalidad: authorData.nacionalidad
          });
        } else {
          eventBus.publish({
            type: 'AUTHOR_UPDATED',
            payload: {
              authorId,
              nombre: authorData.nombre,
              nacionalidad: authorData.nacionalidad
            }
          });
        }
      }
    });

    return observable;
  }

  deleteAuthorReactive(id: number): Observable<void> {
    const observable = this.createObservable(
        api.delete(`/authors/${id}`).then(() => undefined),
        'DELETE_AUTHOR'
    );

    observable.subscribe({
      next: () => {
        if ((eventBus as any).publishAuthorEvent) {
          (eventBus as any).publishAuthorEvent('AUTHOR_DELETED', { authorId: id });
        } else {
          eventBus.publish({
            type: 'AUTHOR_DELETED',
            payload: { authorId: id }
          });
        }
      }
    });

    return observable;
  }

  // ============
  // === LIBROS ==
  // ============

  createBookReactive(data: unknown): Observable<unknown> {
    const observable = this.createObservable(
        api.post('/books', data).then(r => r.data),
        'CREATE_BOOK'
    );

    observable.subscribe({
      next: (book) => {
        eventBus.publish({
          type: 'BOOK_CREATED',
          payload: { bookId: (book as any).id }
        });
      }
    });

    return observable;
  }

  updateBookReactive(id: number, data: unknown): Observable<unknown> {
    const observable = this.createObservable(
        api.put(`/books/${id}`, data).then(r => r.data),
        'UPDATE_BOOK'
    );

    observable.subscribe({
      next: () => {
        eventBus.publish({
          type: 'BOOK_UPDATED',
          payload: { bookId: id }
        });
      }
    });

    return observable;
  }

  deleteBookReactive(id: number): Observable<void> {
    const observable = this.createObservable(
        api.delete(`/books/${id}`).then(() => undefined),
        'DELETE_BOOK'
    );

    observable.subscribe({
      next: () => {
        eventBus.publish({
          type: 'BOOK_DELETED',
          payload: { bookId: id }
        });
      }
    });

    return observable;
  }

  // =================
  // === USUARIOS =====
  // =================

  getUsersReactive(): Observable<unknown[]> {
    return this.createObservable(
        api.get('/users').then(response => response.data),
        'GET_USERS'
    );
  }

  // =================
  // === LIBROS GET ===
  // =================

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
export function useBatchedApi<T>(apiCall: () => Observable<T[]>) {
  return new Observable<T[]>(subscriber => {
    let processed = 0;
    let allData: T[] = [];

    const subscription = apiCall().subscribe({
      next: (batch) => {
        allData = [...allData, ...batch];
        processed += batch.length;

        eventBus.publishSystemEvent(
            `Procesando lote de ${batch.length} elementos`,
            'info',
            {
              batchSize: batch.length,
              totalProcessed: processed,
              timestamp: Date.now()
            }
        );

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
  });
}
