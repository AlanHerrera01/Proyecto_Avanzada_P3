package com.grupobb.biblioteca.service.subscriber;

import com.grupobb.biblioteca.domain.Loan;
import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

public class LoanSubscriber implements Subscriber<Loan> {

    // Cantidad de elementos que se procesan por lote
    private final int batchSize;

    // Controla la suscripción con el Publisher
    private Subscription subscription;

    // Cuenta cuántos préstamos ya se procesaron
    private final AtomicInteger processed = new AtomicInteger(0);

    // Permite esperar hasta que el flujo termine
    private final CountDownLatch done = new CountDownLatch(1);

    // Constructor que recibe el tamaño del lote
    public LoanSubscriber(int batchSize) {
        this.batchSize = batchSize;
    }

    // Se ejecuta cuando el Subscriber se conecta al Publisher
    @Override
    public void onSubscribe(Subscription subscription) {
        this.subscription = subscription;

        System.out.println("");
        System.out.println("==========================================================");
        System.out.println("[Reactive] onSubscribe: Suscripción a préstamos iniciada");
        System.out.println("==========================================================");
        System.out.println("");
        System.out.println("[Reactive] Solicitando análisis de " + batchSize + " préstamos");

        // Se solicita el primer lote de datos
        subscription.request(batchSize);
    }

    // Se ejecuta cada vez que llega un préstamo
    @Override
    public void onNext(Loan prestamo) {

        // Se muestra la información del préstamo recibido
        System.out.println("");
        System.out.println("//////////////////////////////////////////////////////////////");
        System.out.println("[Reactive] onNext: Procesando préstamo ID: " + prestamo.getId()
                + " - Libro: " + prestamo.getLibro().getTitulo());
        System.out.println("//////////////////////////////////////////////////////////////");

        // Se incrementa el contador de préstamos procesados
        int current = processed.incrementAndGet();

        // Cuando se completa un lote, se solicita otro
        if (current % batchSize == 0) {
            System.out.println("[Reactive] Lote de préstamos procesado");
            System.out.println("[Reactive] Solicitando siguiente lote de " + batchSize);
            subscription.request(batchSize);
        }
    }

    // Se ejecuta si ocurre un error en el flujo
    @Override
    public void onError(Throwable t) {
        System.out.println("[Reactive] onError: " + t.getMessage());
        done.countDown();
    }

    // Se ejecuta cuando ya no hay más préstamos
    @Override
    public void onComplete() {
        System.out.println("");
        System.out.println("######################################################################");
        System.out.println("[Reactive] onComplete: Todos los préstamos han sido analizados.");
        System.out.println("######################################################################");
        System.out.println("");
        done.countDown();
    }
}
