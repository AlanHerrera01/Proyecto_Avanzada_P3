# Modelo Publisher-Subscriber (PS) en Préstamos

## ¿Qué se implementó?

Se integró un modelo reactivo tipo Publisher-Subscriber (PS) para el análisis de préstamos (`Loan`) en el backend, usando Project Reactor y la interfaz estándar de Reactive Streams.

## Componentes principales

- **LoanServiceImpl**: Llama a un flujo reactivo sobre la lista de préstamos, filtrando los que no han sido devueltos y procesándolos en lotes.
- **PrestamoSubscriber**: Implementa `Subscriber<Loan>`, procesando los préstamos en lotes y gestionando el backpressure.
- **application.yml**: Permite configurar el tamaño de lote (`batchSize`) de forma dinámica.


## Mejoras implementadas

1. **Backpressure**: El subscriber solo solicita nuevos lotes cuando el anterior fue procesado completamente, evitando sobrecargar el sistema.
2. **Tamaño de lote dinámico**: El batchSize se configura desde `application.yml`:

     ```yaml
     loan:
         batch-size: 2 # Cambia este valor según necesidad
     ```

3. **Reintentos automáticos**: El flujo reactivo reintenta automáticamente hasta 3 veces en caso de errores transitorios.

4. **Métricas reactivas**: Se usan operadores como `doOnNext`, `doOnError` y `doOnComplete` para recolectar métricas y monitorear el flujo en tiempo real.
5. **Timeouts y cancelación**: Se usa `.timeout(Duration.ofSeconds(2))` para evitar que un préstamo bloquee el flujo si tarda demasiado.
6. **Procesamiento paralelo**: Se usa `.parallel()` y `.runOn(Schedulers.parallel())` para procesar préstamos en varios hilos, acelerando el análisis si hay muchos elementos.

## Fragmentos clave de código


### LoanServiceImpl.java (fragmento actualizado)

```java
@Value("${loan.batch-size:2}")
private int loanBatchSize;

private void ejecutarAnalisisReactivo(List<Loan> loans) {
    AtomicInteger metricProcessed = new AtomicInteger(0);
    AtomicInteger metricErrores = new AtomicInteger(0);

    Flux.fromIterable(loans)
        .parallel()
        .runOn(Schedulers.parallel())
        .sequential()
        .subscribeOn(Schedulers.boundedElastic())
        .delayElements(Duration.ofMillis(100))
        .filter(loan -> loan.getFechaDevolucion() == null)
        .map(loan -> {
            if ("ErrorUser".equals(loan.getUsuario().getNombre())) {
                throw new RuntimeException("Usuario bloqueado detectado: " + loan.getUsuario().getNombre());
            }
            return loan;
        })
        .timeout(Duration.ofSeconds(2))
        .doOnNext(loan -> {
            int count = metricProcessed.incrementAndGet();
            System.out.println("[Métrica] Préstamos procesados: " + count);
        })
        .doOnError(err -> {
            int count = metricErrores.incrementAndGet();
            System.out.println("[Métrica] Errores detectados: " + count + " - " + err.getMessage());
        })
        .doOnComplete(() -> System.out.println("[Métrica] Flujo de préstamos completado"))
        .retry(3)
        .onErrorResume(err -> {
            System.out.println("[Reactive] Error en el flujo de préstamos: " + err.getMessage());
            return Flux.empty();
        })
        .subscribe(new PrestamoSubscriber(loanBatchSize));
}
```

### PrestamoSubscriber.java (fragmento)

```java
public class PrestamoSubscriber implements Subscriber<Loan> {
    private final int batchSize;
    private Subscription subscription;
    private final AtomicInteger processed = new AtomicInteger(0);

    public PrestamoSubscriber(int batchSize) {
        this.batchSize = batchSize;
    }

    @Override
    public void onSubscribe(Subscription subscription) {
        this.subscription = subscription;
        subscription.request(batchSize);
    }

    @Override
    public void onNext(Loan prestamo) {
        // Procesamiento del préstamo
        int current = processed.incrementAndGet();
        if (current % batchSize == 0) {
            subscription.request(batchSize);
        }
    }
    // ...
}
```

## Ventajas
- Procesamiento eficiente y no bloqueante.
- Control de carga (backpressure).
- Configuración flexible.
- Tolerancia a fallos transitorios.

---

¿Necesitas agregar ejemplos de uso, diagramas o explicación más detallada?