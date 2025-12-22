package com.grupobb.biblioteca.service.subscriber;

import com.grupobb.biblioteca.domain.Author;
import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

public class AuthorSubscriber implements Subscriber<Author> {

    private final int batchSize;
    private Subscription subscription;
    private final AtomicInteger processed = new AtomicInteger(0);
    private final CountDownLatch done = new CountDownLatch(1);

    public AuthorSubscriber(int batchSize) {
        this.batchSize = batchSize;
    }

    @Override
    public void onSubscribe(Subscription subscription) {
        this.subscription = subscription;

        System.out.println("");
        System.out.println("==========================================================");
        System.out.println("[Reactive] onSubscribe: Suscripción a autores iniciada");
        System.out.println("==========================================================");
        System.out.println("");
        System.out.println("[Reactive] Solicitando análisis de " + batchSize + " autores");
        subscription.request(batchSize);
    }

    @Override
    public void onNext(Author author) {
        System.out.println("");
        System.out.println("//////////////////////////////////////////////////////////////");
        System.out.println("[Reactive] onNext: Procesando autor ID: " + author.getId()
                + " - Nombre: " + author.getNombre()
                + " - Nacionalidad: " + author.getNacionalidad());
        System.out.println("//////////////////////////////////////////////////////////////");

        int current = processed.incrementAndGet();
        if (current % batchSize == 0) {
            System.out.println("[Reactive] Lote de autores procesado");
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
        System.out.println("[Reactive] onComplete: Todos los autores han sido analizados.");
        System.out.println("######################################################################");
        System.out.println("");
        done.countDown();
    }
}
