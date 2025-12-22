package com.grupobb.biblioteca.service.impl;

import com.grupobb.biblioteca.domain.Author;
import com.grupobb.biblioteca.dto.Author.AuthorRequestData;
import com.grupobb.biblioteca.dto.Author.AuthorResponse;
import com.grupobb.biblioteca.repository.AuthorRepository;
import com.grupobb.biblioteca.repository.BookRepository;
import com.grupobb.biblioteca.service.AuthorService;
import com.grupobb.biblioteca.service.subscriber.AuthorSubscriber;
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
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository repository;
    private final BookRepository bookRepository;

    @Value("${author.batch-size:2}")
    private int authorBatchSize;

    public AuthorServiceImpl(AuthorRepository repository, BookRepository bookRepository) {
        this.repository = repository;
        this.bookRepository = bookRepository;
    }

    @Override
    public List<AuthorResponse> findAll() {
        // 1) Traer sincrónico
        List<Author> authors = repository.findAll();

        // 2) Side-effect reactivo (sin bloquear)
        ejecutarAnalisisReactivo(authors);

        // 3) Retornar normal al frontend
        return authors.stream()
                .map(this::toResponse)
                .toList();
    }

    private void ejecutarAnalisisReactivo(List<Author> authors) {
        AtomicInteger metricProcessed = new AtomicInteger(0);
        AtomicInteger metricErrores = new AtomicInteger(0);

        Flux.fromIterable(authors)
                .parallel()
                .runOn(Schedulers.parallel())
                .sequential()
                .subscribeOn(Schedulers.boundedElastic())

                // Simular retardo como en loans
                .delayElements(Duration.ofMillis(100))

                // Filtro ejemplo: solo analizar autores con nacionalidad (puedes cambiarlo)
                .filter(a -> a.getNacionalidad() != null && !a.getNacionalidad().isBlank())

                // Map ejemplo: disparar error si nombre es "ErrorAuthor" (puedes cambiarlo)
                .map(a -> {
                    if ("ErrorAuthor".equalsIgnoreCase(a.getNombre())) {
                        throw new RuntimeException("Autor inválido detectado: " + a.getNombre());
                    }
                    return a;
                })

                .timeout(Duration.ofSeconds(2))

                .doOnNext(a -> {
                    int count = metricProcessed.incrementAndGet();
                    System.out.println("[Métrica] Autores procesados: " + count);
                })
                .doOnError(err -> {
                    int count = metricErrores.incrementAndGet();
                    System.out.println("[Métrica] Errores detectados: " + count + " - " + err.getMessage());
                })
                .doOnComplete(() -> System.out.println("[Métrica] Flujo de autores completado"))

                .retry(3)

                .onErrorResume(err -> {
                    System.out.println("[Reactive] Error en el flujo de autores: " + err.getMessage());
                    return Flux.empty();
                })

                .subscribe(new AuthorSubscriber(authorBatchSize));
    }

    @Override
    public AuthorResponse findById(Long id) {
        Author author = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Autor no encontrado con id " + id));
        return toResponse(author);
    }

    @Override
    @Transactional
    public AuthorResponse create(AuthorRequestData request) {
        Author author = new Author();
        author.setNombre(request.getNombre());
        author.setNacionalidad(request.getNacionalidad());

        Author saved = repository.save(author);

        // Disparar análisis reactivo tras crear
        ejecutarAnalisisReactivo(repository.findAll());

        return toResponse(saved);
    }

    @Override
    @Transactional
    public AuthorResponse update(Long id, AuthorRequestData request) {
        Author author = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Autor no encontrado con id " + id));

        author.setNombre(request.getNombre());
        author.setNacionalidad(request.getNacionalidad());

        Author updated = repository.save(author);

        // Disparar análisis reactivo tras actualizar
        ejecutarAnalisisReactivo(repository.findAll());

        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Author author = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Autor no encontrado con id " + id));

        if (bookRepository.existsByAutor(author)) {
            throw new BadRequestException("No se puede eliminar el autor porque tiene libros asociados");
        }

        repository.deleteById(id);

        // Disparar análisis reactivo tras eliminar
        ejecutarAnalisisReactivo(repository.findAll());
    }

    private AuthorResponse toResponse(Author author) {
        AuthorResponse dto = new AuthorResponse();
        dto.setId(author.getId());
        dto.setNombre(author.getNombre());
        dto.setNacionalidad(author.getNacionalidad());
        return dto;
    }
}
