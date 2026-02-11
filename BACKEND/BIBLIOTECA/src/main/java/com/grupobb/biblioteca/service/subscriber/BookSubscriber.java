package com.grupobb.biblioteca.service.subscriber;

import com.grupobb.biblioteca.domain.Book;
import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Clase que se encarga de recibir y procesar libros de forma reactiva.
 */
public class BookSubscriber implements Subscriber<Book> {

    private final int batchSize; // Tamaño del lote de elementos a solicitar
    private Subscription subscription; // Objeto que nos permite pedir mas datos y cancelar la suscripción
    private final AtomicInteger processed = new AtomicInteger(0); // Contador de libros procesados (hilo-seguro)

    public BookSubscriber(int batchSize) {// Constructor que recibe el tamaño del lote
        this.batchSize = batchSize;
    }

    @Override
    public void onSubscribe(Subscription subscription) {
        // Se guarda la suscripción para poder pedir más datos después
        this.subscription = subscription;

        System.out.println("");
        System.out.println("==========================================================");
        System.out.println("[Reactive] onSubscribe: Suscripción a libros iniciada");
        System.out.println("==========================================================");
        System.out.println("");
        System.out.println("[Reactive] Solicitando análisis de " + batchSize + " libros");

        // Solicita el primer lote de libros al publicador
        subscription.request(batchSize);
    }

    @Override
    public void onNext(Book book) {
        // Se ejecuta cada vez que llega un nuevo libro
        System.out.println("");
        System.out.println("//////////////////////////////////////////////////////////////");
        System.out.println("[Reactive] onNext: Procesando libro ID: " + book.getId()
                + " - Título: " + book.getTitulo());
        System.out.println("//////////////////////////////////////////////////////////////");

        // Incrementa el contador y revisa si ya se terminó el lote actual
        int current = processed.incrementAndGet();
        if (current % batchSize == 0) {
            System.out.println("[Reactive] Lote de libros procesado");
            System.out.println("[Reactive] Solicitando siguiente lote de " + batchSize);
            // Implementa Backpressure: pide más datos solo cuando termina de procesar los actuales
            subscription.request(batchSize);
        }
    }

    @Override
    public void onError(Throwable t) {
        // Se ejecuta si ocurre un error en el flujo de datos
        System.out.println("[Reactive] onError: " + t.getMessage());
    }

    @Override
    public void onComplete() {
        // Se ejecuta cuando ya no hay más libros por procesar
        System.out.println("");
        System.out.println("######################################################################");
        System.out.println("[Reactive] onComplete: Análisis de libros completado");
        System.out.println("######################################################################");
        System.out.println("");
    }
}