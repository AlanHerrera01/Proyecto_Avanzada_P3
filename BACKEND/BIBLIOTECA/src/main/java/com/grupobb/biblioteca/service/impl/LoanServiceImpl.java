package com.grupobb.biblioteca.service.impl;

import com.grupobb.biblioteca.domain.Book;
import com.grupobb.biblioteca.domain.Loan;
import com.grupobb.biblioteca.domain.User;
import com.grupobb.biblioteca.dto.Loan.LoanRequestData;
import com.grupobb.biblioteca.dto.Loan.LoanResponse;
import com.grupobb.biblioteca.repository.BookRepository;
import com.grupobb.biblioteca.repository.LoanRepository;
import com.grupobb.biblioteca.repository.UserRepository;
import com.grupobb.biblioteca.service.LoanService;
import com.grupobb.biblioteca.service.subscriber.LoanSubscriber;
import com.grupobb.biblioteca.web.advice.AlreadyReturnedException;
import com.grupobb.biblioteca.web.advice.BookNotAvailableException;
import com.grupobb.biblioteca.web.advice.NotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class LoanServiceImpl implements LoanService {

    // Repositorios para acceder a la base de datos
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    // Tamaño del lote para el procesamiento reactivo (configurable)
    @Value("${loan.batch-size:2}")
    private int loanBatchSize;

    // Inyección de dependencias
    public LoanServiceImpl(LoanRepository loanRepository,
                           UserRepository userRepository,
                           BookRepository bookRepository) {
        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    // Listar préstamos (método clásico + análisis reactivo en segundo plano)
    @Override
    public List<LoanResponse> list() {

        // 1. Obtener los préstamos de la base de datos (sincrónico)
        List<Loan> loans = loanRepository.findAll();

        // 2. Ejecutar análisis reactivo SIN bloquear la respuesta HTTP
        ejecutarAnalisisReactivo(loans);

        // 3. Retornar la respuesta normal al frontend
        return loans.stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Método que ejecuta el análisis reactivo de los préstamos.
     * Se ejecuta en segundo plano (no afecta al usuario).
     */
    private void ejecutarAnalisisReactivo(List<Loan> loans) {//Recibe los préstamos

        // Métricas simples para monitoreo
        AtomicInteger metricProcessed = new AtomicInteger(0);
        AtomicInteger metricErrores = new AtomicInteger(0);

        Flux.fromIterable(loans)//Los convierte en un flujo reactivo

                // Ejecutar en hilos separados para no bloquear la app
                .parallel()//Se ejecuta en segundo plano
                .runOn(Schedulers.parallel())//Se ejecuta en segundo plano
                .sequential()
                .subscribeOn(Schedulers.boundedElastic())

                // Simular tiempo de procesamiento
                .delayElements(Duration.ofMillis(100))

                // Filtrar solo préstamos NO devueltos
                .filter(loan -> loan.getFechaDevolucion() == null)

                // Simular validación
                .map(loan -> {
                    if ("ErrorUser".equals(loan.getUsuario().getNombre())) {
                        throw new RuntimeException(
                                "Usuario bloqueado detectado: " + loan.getUsuario().getNombre()
                        );
                    }
                    return loan;
                })

                // Evitar que el flujo se quede colgado
                .timeout(Duration.ofSeconds(2))

                // Contar préstamos procesados
                .doOnNext(loan -> {
                    int count = metricProcessed.incrementAndGet();
                    System.out.println("[Métrica] Préstamos procesados: " + count);
                })

                // Contar errores
                .doOnError(err -> {
                    int count = metricErrores.incrementAndGet();
                    System.out.println("[Métrica] Errores detectados: " + count
                            + " - " + err.getMessage());
                })

                // Mensaje al finalizar el flujo
                .doOnComplete(() ->
                        System.out.println("[Métrica] Flujo de préstamos completado")
                )

                // Reintentar hasta 3 veces si ocurre un error
                .retry(3)

                // Manejo final del error para evitar que la app se caiga
                .onErrorResume(err -> {
                    System.out.println("[Reactive] Error en el flujo de préstamos: "
                            + err.getMessage());
                    return Flux.empty();
                })

                // Suscribirse usando el Subscriber personalizado
                .subscribe(new LoanSubscriber(loanBatchSize));
    }

    // Crear un nuevo préstamo
    @Override
    @Transactional
    public LoanResponse createLoan(LoanRequestData request) {

        // Validar usuario
        User user = userRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Validar libro
        Book book = bookRepository.findById(request.getLibroId())
                .orElseThrow(() -> new NotFoundException("Libro no encontrado"));

        // Verificar disponibilidad
        if (!book.isDisponible()) {
            throw new BookNotAvailableException("El libro no está disponible");
        }

        // Crear préstamo
        Loan loan = new Loan();
        loan.setUsuario(user);
        loan.setLibro(book);
        loan.setFechaPrestamo(LocalDate.now());
        loan.setFechaDevolucion(null);

        // Marcar libro como no disponible
        book.setDisponible(false);
        bookRepository.save(book);

        // Guardar préstamo
        Loan saved = loanRepository.save(loan);

        // Ejecutar análisis reactivo tras crear el préstamo
        ejecutarAnalisisReactivo(loanRepository.findAll());

        return toResponse(saved);
    }

    // Devolver un libro
    @Override
    @Transactional
    public LoanResponse returnLoan(Long loanId) {

        // Buscar préstamo
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new NotFoundException("Préstamo no encontrado"));

        // Validar que no haya sido devuelto antes
        if (loan.getFechaDevolucion() != null) {
            throw new AlreadyReturnedException("El libro ya fue devuelto");
        }

        // Registrar devolución
        loan.setFechaDevolucion(LocalDate.now());

        // Marcar libro como disponible
        Book book = loan.getLibro();
        book.setDisponible(true);
        bookRepository.save(book);

        // Guardar cambios
        Loan updated = loanRepository.save(loan);

        // Ejecutar análisis reactivo tras la devolución
        ejecutarAnalisisReactivo(loanRepository.findAll());//Para analizar datos actualizados.

        return toResponse(updated);
    }

    // Obtener préstamo por ID
    @Override
    public LoanResponse getById(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new NotFoundException("Préstamo no encontrado"));
        return toResponse(loan);
    }

    // Convertir entidad Loan a DTO de respuesta
    private LoanResponse toResponse(Loan loan) {
        LoanResponse r = new LoanResponse();
        r.setId(loan.getId());
        r.setUsuarioNombre(loan.getUsuario().getNombre());
        r.setLibroTitulo(loan.getLibro().getTitulo());
        r.setFechaPrestamo(loan.getFechaPrestamo());
        r.setFechaDevolucion(loan.getFechaDevolucion());
        return r;
    }
}
