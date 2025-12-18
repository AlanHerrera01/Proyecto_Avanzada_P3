package com.grupobb.biblioteca.service.subscriber;

import com.grupobb.biblioteca.domain.Loan;
import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

// Adaptación de CafeSubscriber para la entidad Loan
public class PrestamoSubscriber implements Subscriber<Loan> {

    private final int batchSize;
    private Subscription subscription;
    private final AtomicInteger processed = new AtomicInteger(0);
    // Usamos CountDownLatch si quisiéramos esperar, aunque en web es mejor no bloquear
    private final CountDownLatch done = new CountDownLatch(1);

    public PrestamoSubscriber(int batchSize) {
        this.batchSize = batchSize;
    }

    @Override
    public void onSubscribe(Subscription subscription) {
        this.subscription = subscription;

        System.out.println("");
        System.out.println("==========================================================");
        System.out.println("[Reactive] onSubscribe: Suscripción a préstamos iniciada");
        System.out.println("==========================================================");
        System.out.println("");
        System.out.println("[Reactive] Solicitando análisis de " + batchSize + " préstamos");
        subscription.request(batchSize);
    }

    @Override
    public void onNext(Loan prestamo) {
        // Lógica de procesamiento de cada elemento
        System.out.println("");
        System.out.println("//////////////////////////////////////////////////////////////");
        System.out.println("[Reactive] onNext: Procesando préstamo ID: " + prestamo.getId()
                + " - Libro: " + prestamo.getLibro().getTitulo());
        System.out.println("//////////////////////////////////////////////////////////////");
        if (processed.incrementAndGet() >= batchSize) {
            processed.set(0);
            System.out.println("[Reactive] Lote de préstamos procesado");
            System.out.println("[Reactive] Solicitando siguiente lote de " + batchSize);
            subscription.request(batchSize);
        }

    }

    @Override
    public void onError(Throwable t) {
        System.out.println("[Reactive] onError: " + t.getMessage());
        done.countDown();
    }

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