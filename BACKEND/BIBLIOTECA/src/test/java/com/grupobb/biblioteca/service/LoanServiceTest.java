package com.grupobb.biblioteca.service;

import com.grupobb.biblioteca.domain.Author;
import com.grupobb.biblioteca.domain.Book;
import com.grupobb.biblioteca.domain.Loan;
import com.grupobb.biblioteca.domain.User;
import com.grupobb.biblioteca.dto.Loan.LoanRequestData;
import com.grupobb.biblioteca.dto.Loan.LoanResponse;
import com.grupobb.biblioteca.repository.BookRepository;
import com.grupobb.biblioteca.repository.LoanRepository;
import com.grupobb.biblioteca.repository.UserRepository;
import com.grupobb.biblioteca.service.impl.LoanServiceImpl;
import com.grupobb.biblioteca.web.advice.AlreadyReturnedException;
import com.grupobb.biblioteca.web.advice.BookNotAvailableException;
import com.grupobb.biblioteca.web.advice.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para LoanService usando Mockito
 * 
 * Cobertura de casos críticos:
 * 1. Crear préstamo con datos válidos
 * 2. Crear préstamo cuando el usuario no existe
 * 3. Crear préstamo cuando el libro no existe
 * 4. Crear préstamo cuando el libro no está disponible
 * 5. Devolver libro de préstamo activo
 * 6. Devolver libro que ya fue devuelto
 * 
 * Patrón de pruebas: AAA (Arrange-Act-Assert)
 * Framework de mocking: Mockito
 */
public class LoanServiceTest {

    // Mocks de las dependencias del servicio
    private LoanRepository loanRepository;
    private UserRepository userRepository;
    private BookRepository bookRepository;
    
    // Servicio bajo prueba (SUT - System Under Test)
    private LoanService loanService;

    /**
     * Configuración inicial que se ejecuta antes de cada prueba.
     * Crea mocks de las dependencias e inyecta el servicio real.
     */
    @BeforeEach
    void setUp() {
        // Crear mocks de los repositorios
        loanRepository = mock(LoanRepository.class);
        userRepository = mock(UserRepository.class);
        bookRepository = mock(BookRepository.class);
        
        // Crear instancia real del servicio con dependencias mockeadas
        loanService = new LoanServiceImpl(loanRepository, userRepository, bookRepository);
    }

    /**
     * PRUEBA 1: Crear préstamo con datos válidos
     * 
     * Objetivo: Verificar que el sistema crea correctamente un préstamo cuando
     *          el usuario existe, el libro existe y está disponible.
     * 
     * Resultado esperado:
     * - Se crea el préstamo con fecha actual
     * - El libro queda marcado como NO disponible
     * - Se retorna un LoanResponse con todos los datos correctos
     */
    @Test
    void crearPrestamo_datosValidos_retornaPrestamoCreado() {
        // ========== ARRANGE (Preparar) ==========
        // Configuramos los IDs de usuario y libro
        Long usuarioId = 1L;
        Long libroId = 1L;

        // Creamos un usuario válido
        User user = new User();
        user.setId(usuarioId);
        user.setNombre("Carlos Mendoza");
        user.setEmail("carlos.mendoza@test.com");

        // Creamos un autor para el libro
        Author author = new Author();
        author.setId(1L);
        author.setNombre("Martin Fowler");

        // Creamos un libro disponible
        Book book = new Book();
        book.setId(libroId);
        book.setTitulo("Refactoring");
        book.setAutor(author);
        book.setDisponible(true); // Libro disponible para préstamo

        // Creamos el request con los IDs
        LoanRequestData request = new LoanRequestData();
        request.setUsuarioId(usuarioId);
        request.setLibroId(libroId);

        // Configuramos el comportamiento de los mocks
        when(userRepository.findById(usuarioId)).thenReturn(Optional.of(user));
        when(bookRepository.findById(libroId)).thenReturn(Optional.of(book));
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> {
            Loan loan = invocation.getArgument(0);
            loan.setId(1L); // Simulamos que la BD asigna un ID
            return loan;
        });
        when(bookRepository.save(any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // ========== ACT (Actuar) ==========
        // Ejecutamos el método bajo prueba
        LoanResponse response = loanService.createLoan(request);

        // ========== ASSERT (Verificar) ==========
        // Verificamos que la respuesta no sea nula
        assertNotNull(response, "La respuesta no debe ser nula");
        assertNotNull(response.getId(), "El ID del préstamo debe estar asignado");
        
        // Verificamos que los datos del préstamo sean correctos
        assertEquals("Carlos Mendoza", response.getUsuarioNombre(), "El nombre del usuario debe coincidir");
        assertEquals("Refactoring", response.getLibroTitulo(), "El título del libro debe coincidir");
        assertEquals(LocalDate.now(), response.getFechaPrestamo(), "La fecha de préstamo debe ser hoy");
        assertNull(response.getFechaDevolucion(), "La fecha de devolución debe ser nula (préstamo activo)");
        
        // Verificamos que se llamaron los métodos esperados
        verify(loanRepository).save(any(Loan.class));
        verify(bookRepository).save(any(Book.class));
    }

    /**
     * PRUEBA 2: Intentar crear préstamo con usuario inexistente
     * 
     * Objetivo: Verificar que el sistema rechaza la creación de un préstamo
     *          cuando el usuario especificado no existe en la base de datos.
     * 
     * Resultado esperado:
     * - Se lanza una NotFoundException con mensaje específico
     * - NO se guarda ningún préstamo
     * - NO se modifica el estado del libro
     */
    @Test
    void crearPrestamo_usuarioNoExiste_lanzaExcepcion() {
        // ========== ARRANGE (Preparar) ==========
        // Configuramos un ID de usuario que NO existe
        Long usuarioId = 999L;
        Long libroId = 1L;

        // Creamos un autor válido
        Author author = new Author();
        author.setId(1L);
        author.setNombre("Joshua Bloch");

        // Creamos un libro válido y disponible
        Book book = new Book();
        book.setId(libroId);
        book.setTitulo("Effective Java");
        book.setAutor(author);
        book.setDisponible(true);

        // Creamos el request con ID de usuario inexistente
        LoanRequestData request = new LoanRequestData();
        request.setUsuarioId(usuarioId);
        request.setLibroId(libroId);

        // Configuramos los mocks: usuario NO existe, libro SÍ existe
        when(userRepository.findById(usuarioId)).thenReturn(Optional.empty());
        when(bookRepository.findById(libroId)).thenReturn(Optional.of(book));

        // ========== ACT & ASSERT (Actuar y Verificar) ==========
        // Verificamos que se lance la excepción esperada
        NotFoundException ex = assertThrows(NotFoundException.class, () ->
                loanService.createLoan(request),
                "Debe lanzar NotFoundException cuando el usuario no existe");

        // Verificamos el mensaje de la excepción
        assertEquals("Usuario no encontrado", ex.getMessage(), 
                "El mensaje de error debe ser específico");
        
        // Verificamos que NO se guardó nada (integridad de datos)
        verify(loanRepository, never()).save(any());
        verify(bookRepository, never()).save(any());
    }

    /**
     * PRUEBA 3: Intentar crear préstamo con libro inexistente
     * 
     * Objetivo: Verificar que el sistema rechaza la creación de un préstamo
     *          cuando el libro especificado no existe en la base de datos.
     * 
     * Resultado esperado:
     * - Se lanza una NotFoundException con mensaje específico
     * - NO se guarda ningún préstamo
     */
    @Test
    void crearPrestamo_libroNoExiste_lanzaExcepcion() {
        // ========== ARRANGE (Preparar) ==========
        // Configuramos IDs: usuario válido, libro inexistente
        Long usuarioId = 1L;
        Long libroId = 999L; // ID que NO existe en la BD

        // Creamos un usuario válido
        User user = new User();
        user.setId(usuarioId);
        user.setNombre("Ana Torres");
        user.setEmail("ana.torres@test.com");

        // Creamos el request con ID de libro inexistente
        LoanRequestData request = new LoanRequestData();
        request.setUsuarioId(usuarioId);
        request.setLibroId(libroId);

        // Configuramos los mocks: usuario SÍ existe, libro NO existe
        when(userRepository.findById(usuarioId)).thenReturn(Optional.of(user));
        when(bookRepository.findById(libroId)).thenReturn(Optional.empty());

        // ========== ACT & ASSERT (Actuar y Verificar) ==========
        // Verificamos que se lance la excepción esperada
        NotFoundException ex = assertThrows(NotFoundException.class, () ->
                loanService.createLoan(request),
                "Debe lanzar NotFoundException cuando el libro no existe");

        // Verificamos el mensaje de la excepción
        assertEquals("Libro no encontrado", ex.getMessage(),
                "El mensaje de error debe ser específico");
        
        // Verificamos que NO se guardó ningún préstamo
        verify(loanRepository, never()).save(any());
    }

    /**
     * PRUEBA 4: Intentar crear préstamo con libro no disponible
     * 
     * Objetivo: Verificar que el sistema rechaza la creación de un préstamo
     *          cuando el libro ya está prestado a otro usuario (no disponible).
     * 
     * Resultado esperado:
     * - Se lanza una BookNotAvailableException con mensaje específico
     * - NO se crea el préstamo
     * - Se protege la integridad del negocio (un libro solo puede estar prestado una vez)
     */
    @Test
    void crearPrestamo_libroNoDisponible_lanzaExcepcion() {
        // ========== ARRANGE (Preparar) ==========
        // Configuramos IDs válidos
        Long usuarioId = 1L;
        Long libroId = 1L;

        // Creamos un usuario válido
        User user = new User();
        user.setId(usuarioId);
        user.setNombre("Pedro Ramírez");
        user.setEmail("pedro.ramirez@test.com");

        // Creamos un autor válido
        Author author = new Author();
        author.setId(1L);
        author.setNombre("Eric Evans");

        // Creamos un libro que NO está disponible (ya prestado)
        Book book = new Book();
        book.setId(libroId);
        book.setTitulo("Domain-Driven Design");
        book.setAutor(author);
        book.setDisponible(false); // Libro ya prestado a alguien más

        // Creamos el request válido
        LoanRequestData request = new LoanRequestData();
        request.setUsuarioId(usuarioId);
        request.setLibroId(libroId);

        // Configuramos los mocks: ambos existen pero libro NO disponible
        when(userRepository.findById(usuarioId)).thenReturn(Optional.of(user));
        when(bookRepository.findById(libroId)).thenReturn(Optional.of(book));

        // ========== ACT & ASSERT (Actuar y Verificar) ==========
        // Verificamos que se lance la excepción de negocio
        BookNotAvailableException ex = assertThrows(BookNotAvailableException.class, () ->
                loanService.createLoan(request),
                "Debe lanzar BookNotAvailableException cuando el libro no está disponible");

        // Verificamos el mensaje de la excepción
        assertEquals("El libro no está disponible", ex.getMessage(),
                "El mensaje debe indicar claramente que el libro no está disponible");
        
        // Verificamos que NO se creó el préstamo (regla de negocio protegida)
        verify(loanRepository, never()).save(any());
    }

    /**
     * PRUEBA 5: Devolver libro de un préstamo activo
     * 
     * Objetivo: Verificar que el sistema procesa correctamente la devolución
     *          de un libro cuando el préstamo está activo (no devuelto previamente).
     * 
     * Resultado esperado:
     * - Se registra la fecha de devolución (hoy)
     * - El libro vuelve a estar disponible
     * - Se retorna un LoanResponse actualizado
     */
    @Test
    void devolverLibro_prestamoActivo_retornaExitosamente() {
        // ========== ARRANGE (Preparar) ==========
        // Configuramos los IDs
        Long loanId = 1L;
        Long usuarioId = 1L;
        Long libroId = 1L;

        // Creamos un usuario que tiene el préstamo
        User user = new User();
        user.setId(usuarioId);
        user.setNombre("Laura Gómez");
        user.setEmail("laura.gomez@test.com");

        // Creamos un autor
        Author author = new Author();
        author.setId(1L);
        author.setNombre("Kent Beck");

        // Creamos un libro que está prestado (no disponible)
        Book book = new Book();
        book.setId(libroId);
        book.setTitulo("Test Driven Development");
        book.setAutor(author);
        book.setDisponible(false); // No disponible porque está prestado

        // Creamos un préstamo ACTIVO (sin fecha de devolución)
        Loan loan = new Loan();
        loan.setId(loanId);
        loan.setUsuario(user);
        loan.setLibro(book);
        loan.setFechaPrestamo(LocalDate.now().minusDays(7)); // Prestado hace 7 días
        loan.setFechaDevolucion(null); // NULL = préstamo activo

        // Configuramos los mocks
        when(loanRepository.findById(loanId)).thenReturn(Optional.of(loan));
        when(bookRepository.save(any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // ========== ACT (Actuar) ==========
        // Ejecutamos la devolución del libro
        LoanResponse response = loanService.returnLoan(loanId);

        // ========== ASSERT (Verificar) ==========
        // Verificamos que la respuesta no sea nula
        assertNotNull(response, "La respuesta no debe ser nula");
        
        // Verificamos que se registró la fecha de devolución
        assertEquals(LocalDate.now(), response.getFechaDevolucion(),
                "La fecha de devolución debe ser hoy");
        
        // Verificamos que la fecha de préstamo original se mantiene
        assertEquals(LocalDate.now().minusDays(7), response.getFechaPrestamo(),
                "La fecha de préstamo original debe mantenerse");
        
        // Verificamos que se guardaron los cambios
        verify(loanRepository).save(any(Loan.class));
        verify(bookRepository).save(any(Book.class));
    }

    /**
     * PRUEBA 6: Intentar devolver libro que ya fue devuelto
     * 
     * Objetivo: Verificar que el sistema rechaza la devolución de un libro
     *          cuando el préstamo ya tiene una fecha de devolución registrada.
     * 
     * Resultado esperado:
     * - Se lanza una AlreadyReturnedException con mensaje específico
     * - NO se modifica el préstamo existente
     * - NO se modifica el estado del libro
     * - Se protege la integridad de los datos históricos
     */
    @Test
    void devolverLibro_libroYaDevuelto_lanzaExcepcion() {
        // ========== ARRANGE (Preparar) ==========
        // Configuramos los IDs
        Long loanId = 1L;
        Long usuarioId = 1L;
        Long libroId = 1L;

        // Creamos un usuario
        User user = new User();
        user.setId(usuarioId);
        user.setNombre("Miguel Sánchez");
        user.setEmail("miguel.sanchez@test.com");

        // Creamos un autor
        Author author = new Author();
        author.setId(1L);
        author.setNombre("Robert C. Martin");

        // Creamos un libro que ya está disponible (fue devuelto)
        Book book = new Book();
        book.setId(libroId);
        book.setTitulo("Clean Architecture");
        book.setAutor(author);
        book.setDisponible(true); // Disponible porque ya fue devuelto

        // Creamos un préstamo que YA FUE DEVUELTO hace 5 días
        Loan loan = new Loan();
        loan.setId(loanId);
        loan.setUsuario(user);
        loan.setLibro(book);
        loan.setFechaPrestamo(LocalDate.now().minusDays(15)); // Prestado hace 15 días
        loan.setFechaDevolucion(LocalDate.now().minusDays(5)); // DEVUELTO hace 5 días

        // Configuramos el mock
        when(loanRepository.findById(loanId)).thenReturn(Optional.of(loan));

        // ========== ACT & ASSERT (Actuar y Verificar) ==========
        // Verificamos que se lance la excepción de negocio
        AlreadyReturnedException ex = assertThrows(AlreadyReturnedException.class, () ->
                loanService.returnLoan(loanId),
                "Debe lanzar AlreadyReturnedException cuando el libro ya fue devuelto");

        // Verificamos el mensaje de la excepción
        assertEquals("El libro ya fue devuelto", ex.getMessage(),
                "El mensaje debe indicar que el libro ya fue devuelto previamente");
        
        // Verificamos que NO se modificó nada (protección de datos históricos)
        verify(loanRepository, never()).save(any());
        verify(bookRepository, never()).save(any());
    }
}
