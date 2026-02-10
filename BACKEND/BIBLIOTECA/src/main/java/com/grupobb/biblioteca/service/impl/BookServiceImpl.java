package com.grupobb.biblioteca.service.impl;

import com.grupobb.biblioteca.domain.Author;
import com.grupobb.biblioteca.domain.Book;
import com.grupobb.biblioteca.dto.Book.BookRequestData;
import com.grupobb.biblioteca.dto.Book.BookResponse;
import com.grupobb.biblioteca.repository.AuthorRepository;
import com.grupobb.biblioteca.repository.BookRepository;
import com.grupobb.biblioteca.repository.LoanRepository;
import com.grupobb.biblioteca.service.BookService;
import com.grupobb.biblioteca.service.subscriber.BookSubscriber;
import com.grupobb.biblioteca.web.advice.BadRequestException;
import com.grupobb.biblioteca.web.advice.NotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final LoanRepository loanRepository;

    // Tamaño del lote configurado en application.properties
    @Value("${book.batch-size:2}")
    private int bookBatchSize;

    public BookServiceImpl(BookRepository bookRepository,
                           AuthorRepository authorRepository,
                           LoanRepository loanRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.loanRepository = loanRepository;
    }

    @Override
    public List<BookResponse> findAll() {
        List<Book> books = bookRepository.findAll();
        // Dispara el análisis reactivo de fondo
        ejecutarAnalisisReactivoLibros(books);

        return books.stream()
                .map(this::toResponse)
                .toList();
    }

    private void ejecutarAnalisisReactivoLibros(List<Book> books) {
        // Contadores atómicos para métricas en hilos paralelos
        AtomicInteger metricProcessed = new AtomicInteger(0);
        AtomicInteger metricErrores = new AtomicInteger(0);

        Flux.fromIterable(books)
                // Inicia procesamiento paralelo
                .parallel()
                .runOn(Schedulers.parallel())
                .sequential()
                // Define el hilo de ejecución elástico para no bloquear el principal
                .subscribeOn(Schedulers.boundedElastic())

                // Simular retraso de procesamiento (100ms por libro)
                .delayElements(Duration.ofMillis(100))

                // Solo procesa los que están disponibles
                .filter(Book::isDisponible)

                // Lógica de validación: si el título contiene "error", lanza excepción
                .map(book -> {
                    if (book.getTitulo().toLowerCase().contains("error")) {
                        throw new RuntimeException("Libro inválido detectado: " + book.getTitulo());
                    }
                    return book;
                })

                // Si el flujo tarda más de 2 segundos, corta la ejecución
                .timeout(Duration.ofSeconds(2))

                // Efectos secundarios: registro de métricas y logs
                .doOnNext(book -> {
                    int count = metricProcessed.incrementAndGet();
                    System.out.println("[Métrica] Libros procesados: " + count);
                })
                .doOnError(err -> {
                    int count = metricErrores.incrementAndGet();
                    System.out.println("[Métrica] Errores libros: " + count + " - " + err.getMessage());
                })
                .doOnComplete(() ->
                        System.out.println("[Métrica] Flujo de libros completado")
                )

                // En caso de error, reintenta el flujo hasta 3 veces
                .retry(3)

                // Si después de reintentar sigue fallando, devuelve un flujo vacío para no romper la app
                .onErrorResume(err -> {
                    System.out.println("[Reactive] Error en análisis de libros: " + err.getMessage());
                    return Flux.empty();
                })
                // Se suscribe usando el BookSubscriber personalizado (maneja Backpressure)
                .subscribe(new BookSubscriber(bookBatchSize));
    }

    @Override
    public BookResponse findById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Libro no encontrado con id " + id));

        ejecutarAnalisisReactivoLibros(bookRepository.findAll());

        return toResponse(book);
    }

    @Override
    @Transactional
    public BookResponse create(BookRequestData request) {
        // Busca autor antes de crear el libro
        Author autor = authorRepository.findById(request.getAutorId())
                .orElseThrow(() -> new NotFoundException("Autor no encontrado con id " + request.getAutorId()));

        Book book = new Book();
        book.setTitulo(request.getTitulo());
        book.setAutor(autor);
        book.setDisponible(request.getDisponible() != null ? request.getDisponible() : true);

        Book saved = bookRepository.save(book);
        ejecutarAnalisisReactivoLibros(bookRepository.findAll());

        return toResponse(saved);
    }

    @Override
    @Transactional
    public BookResponse update(Long id, BookRequestData request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Libro no encontrado con id " + id));

        book.setTitulo(request.getTitulo());

        // Actualización condicional del autor
        if (request.getAutorId() != null) {
            Author autor = authorRepository.findById(request.getAutorId())
                    .orElseThrow(() -> new NotFoundException("Autor no encontrado con id " + request.getAutorId()));
            book.setAutor(autor);
        }

        if (request.getDisponible() != null) {
            book.setDisponible(request.getDisponible());
        }

        Book updated = bookRepository.save(book);
        ejecutarAnalisisReactivoLibros(bookRepository.findAll());

        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Libro no encontrado con id " + id));

        // Regla de negocio: No eliminar si hay préstamos sin devolver
        if (loanRepository.existsByLibroAndFechaDevolucionIsNull(book)) {
            throw new BadRequestException("No se puede eliminar el libro porque tiene préstamos activos");
        }
        ejecutarAnalisisReactivoLibros(bookRepository.findAll());

        bookRepository.deleteById(id);
    }

    // Convierte la entidad de BD a un objeto de respuesta (DTO)
    private BookResponse toResponse(Book book) {
        BookResponse dto = new BookResponse();
        dto.setId(book.getId());
        dto.setTitulo(book.getTitulo());
        if (book.getAutor() != null) {
            dto.setAutorId(book.getAutor().getId());
            dto.setAutorNombre(book.getAutor().getNombre());
        }
        dto.setDisponible(book.isDisponible());
        return dto;
    }
}