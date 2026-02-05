package com.grupobb.biblioteca.service.subscriber;

import com.grupobb.biblioteca.domain.Book;
import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;

import java.util.concurrent.atomic.AtomicInteger;

public class BookSubscriber implements Subscriber<Book> {

    private final int batchSize;
    private Subscription subscription;
    private final AtomicInteger processed = new AtomicInteger(0);

    public BookSubscriber(int batchSize) {
        this.batchSize = batchSize;
    }

    @Override
    public void onSubscribe(Subscription subscription) {
        this.subscription = subscription;

        System.out.println("");
        System.out.println("==========================================================");
        System.out.println("[Reactive] onSubscribe: Suscripción a libros iniciada");
        System.out.println("==========================================================");
        System.out.println("");
        System.out.println("[Reactive] Solicitando análisis de " + batchSize + " libros");

        subscription.request(batchSize);
    }

    @Override
    public void onNext(Book book) {
        System.out.println("");
        System.out.println("//////////////////////////////////////////////////////////////");
        System.out.println("[Reactive] onNext: Procesando libro ID: " + book.getId()
                + " - Título: " + book.getTitulo());
        System.out.println("//////////////////////////////////////////////////////////////");

        int current = processed.incrementAndGet();
        if (current % batchSize == 0) {
            System.out.println("[Reactive] Lote de libros procesado");
            System.out.println("[Reactive] Solicitando siguiente lote de " + batchSize);
            subscription.request(batchSize);
        }
    }

    @Override
    public void onError(Throwable t) {
        System.out.println("[Reactive] onError: " + t.getMessage());
    }

    @Override
    public void onComplete() {
        System.out.println("");
        System.out.println("######################################################################");
        System.out.println("[Reactive] onComplete: Análisis de libros completado");
        System.out.println("######################################################################");
        System.out.println("");
    }
}
