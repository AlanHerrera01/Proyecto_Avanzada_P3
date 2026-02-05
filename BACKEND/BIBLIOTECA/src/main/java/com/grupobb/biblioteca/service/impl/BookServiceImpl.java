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

        ejecutarAnalisisReactivoLibros(books);

        return books.stream()
                .map(this::toResponse)
                .toList();
    }


    private void ejecutarAnalisisReactivoLibros(List<Book> books) {

        AtomicInteger metricProcessed = new AtomicInteger(0);
        AtomicInteger metricErrores = new AtomicInteger(0);

        Flux.fromIterable(books)

                .parallel()
                .runOn(Schedulers.parallel())
                .sequential()
                .subscribeOn(Schedulers.boundedElastic())

                // Simular procesamiento
                .delayElements(Duration.ofMillis(100))

                // Filtro: solo libros disponibles
                .filter(Book::isDisponible)

                // Validación simulada
                .map(book -> {
                    if (book.getTitulo().toLowerCase().contains("error")) {
                        throw new RuntimeException("Libro inválido detectado: " + book.getTitulo());
                    }
                    return book;
                })

                .timeout(Duration.ofSeconds(2))

                // Métricas
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

                .retry(3)


                .onErrorResume(err -> {
                    System.out.println("[Reactive] Error en análisis de libros: " + err.getMessage());
                    return Flux.empty();
                })
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
        Author autor = authorRepository.findById(request.getAutorId())
                .orElseThrow(() -> new NotFoundException("Autor no encontrado con id " + request.getAutorId()));

        Book book = new Book();
        book.setTitulo(request.getTitulo());
        book.setAutor(autor);
        // si viene null, por defecto true
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
        
        // Validar que no tenga préstamos activos
        if (loanRepository.existsByLibroAndFechaDevolucionIsNull(book)) {
            throw new BadRequestException("No se puede eliminar el libro porque tiene préstamos activos");
        }
        ejecutarAnalisisReactivoLibros(bookRepository.findAll());

        bookRepository.deleteById(id);
    }

    // Mapper privado: Entity -> DTO
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
