package com.grupobb.biblioteca.service;

import com.grupobb.biblioteca.domain.Author;
import com.grupobb.biblioteca.domain.Book;
import com.grupobb.biblioteca.dto.Book.BookRequestData;
import com.grupobb.biblioteca.dto.Book.BookResponse;
import com.grupobb.biblioteca.repository.AuthorRepository;
import com.grupobb.biblioteca.repository.BookRepository;
import com.grupobb.biblioteca.repository.LoanRepository;
import com.grupobb.biblioteca.service.impl.BookServiceImpl;
import com.grupobb.biblioteca.web.advice.BadRequestException;
import com.grupobb.biblioteca.web.advice.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para BookService usando Mockito.
 *
 * Cobertura de casos:
 * 1. Listar libros (mapea correctamente DTO)
 * 2. Obtener libro por ID existente
 * 3. Obtener libro por ID inexistente
 * 4. Crear libro con autor existente
 * 5. Crear libro con autor inexistente
 * 6. Actualizar título del libro existente
 * 7. Actualizar libro inexistente
 * 8. Actualizar autor cuando autorId viene (autor existe / no existe)
 * 9. Eliminar libro sin préstamos activos
 * 10. Eliminar libro con préstamos activos
 *
 * Patrón: AAA (Arrange-Act-Assert)
 */
public class BookServiceTest {

    private BookRepository bookRepository;
    private AuthorRepository authorRepository;
    private LoanRepository loanRepository;

    private BookServiceImpl bookService;

    @BeforeEach
    void setUp() {
        bookRepository = mock(BookRepository.class);
        authorRepository = mock(AuthorRepository.class);
        loanRepository = mock(LoanRepository.class);

        bookService = new BookServiceImpl(bookRepository, authorRepository, loanRepository);
    }

    /**
     * PRUEBA 1: Listar libros
     * Objetivo: validar que mapea correctamente a BookResponse y retorna lista.
     */
    @Test
    void findAll_retornaListaDeLibros() {
        // Arrange
        Author a1 = new Author();
        a1.setId(10L);
        a1.setNombre("Robert C. Martin");

        Book b1 = new Book();
        b1.setId(1L);
        b1.setTitulo("Clean Code");
        b1.setAutor(a1);
        b1.setDisponible(true);

        Book b2 = new Book();
        b2.setId(2L);
        b2.setTitulo("Refactoring");
        b2.setAutor(a1);
        b2.setDisponible(false);

        when(bookRepository.findAll()).thenReturn(List.of(b1, b2));

        // Act
        List<BookResponse> response = bookService.findAll();

        // Assert
        assertNotNull(response);
        assertEquals(2, response.size());

        assertEquals(1L, response.get(0).getId());
        assertEquals("Clean Code", response.get(0).getTitulo());
        assertEquals(10L, response.get(0).getAutorId());
        assertEquals("Robert C. Martin", response.get(0).getAutorNombre());
        assertTrue(response.get(0).isDisponible());

        assertEquals(2L, response.get(1).getId());
        assertEquals("Refactoring", response.get(1).getTitulo());
        assertFalse(response.get(1).isDisponible());

        verify(bookRepository).findAll();
    }

    /**
     * PRUEBA 2: Obtener libro por ID existente
     */
    @Test
    void findById_idExistente_retornaLibro() {
        // Arrange
        Long bookId = 1L;

        Author author = new Author();
        author.setId(5L);
        author.setNombre("Kent Beck");

        Book book = new Book();
        book.setId(bookId);
        book.setTitulo("TDD");
        book.setAutor(author);
        book.setDisponible(true);

        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));
        when(bookRepository.findAll()).thenReturn(List.of(book)); // usado por el análisis reactivo

        // Act
        BookResponse response = bookService.findById(bookId);

        // Assert
        assertNotNull(response);
        assertEquals(bookId, response.getId());
        assertEquals("TDD", response.getTitulo());
        assertEquals(5L, response.getAutorId());
        assertEquals("Kent Beck", response.getAutorNombre());
        assertTrue(response.isDisponible());

        verify(bookRepository).findById(bookId);
    }

    /**
     * PRUEBA 3: Obtener libro por ID inexistente
     */
    @Test
    void findById_idNoExistente_lanzaNotFoundException() {
        // Arrange
        Long bookId = 999L;
        when(bookRepository.findById(bookId)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> bookService.findById(bookId));

        assertEquals("Libro no encontrado con id " + bookId, ex.getMessage());
        verify(bookRepository).findById(bookId);
    }

    /**
     * PRUEBA 4: Crear libro con autor existente (disponible null -> true por defecto)
     */
    @Test
    void create_autorExiste_retornaLibroCreado() {
        // Arrange
        Long autorId = 7L;

        Author author = new Author();
        author.setId(autorId);
        author.setNombre("Martin Fowler");

        BookRequestData request = new BookRequestData();
        request.setTitulo("Refactoring");
        request.setAutorId(autorId);
        request.setDisponible(null); // debe default a true

        Book saved = new Book();
        saved.setId(1L);
        saved.setTitulo("Refactoring");
        saved.setAutor(author);
        saved.setDisponible(true);

        when(authorRepository.findById(autorId)).thenReturn(Optional.of(author));
        when(bookRepository.save(any(Book.class))).thenReturn(saved);
        when(bookRepository.findAll()).thenReturn(List.of(saved)); // usado por el análisis reactivo

        // Act
        BookResponse response = bookService.create(request);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Refactoring", response.getTitulo());
        assertEquals(autorId, response.getAutorId());
        assertEquals("Martin Fowler", response.getAutorNombre());
        assertTrue(response.isDisponible());

        verify(authorRepository).findById(autorId);
        verify(bookRepository).save(any(Book.class));
    }

    /**
     * PRUEBA 5: Crear libro con autor inexistente
     */
    @Test
    void create_autorNoExiste_lanzaNotFoundException() {
        // Arrange
        Long autorId = 99L;

        BookRequestData request = new BookRequestData();
        request.setTitulo("Nuevo Libro");
        request.setAutorId(autorId);

        when(authorRepository.findById(autorId)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> bookService.create(request));

        assertEquals("Autor no encontrado con id " + autorId, ex.getMessage());
        verify(bookRepository, never()).save(any(Book.class));
    }

    /**
     * PRUEBA 6: Actualizar libro existente (solo título)
     */
    @Test
    void update_libroExiste_actualizaTitulo() {
        // Arrange
        Long bookId = 1L;

        Author author = new Author();
        author.setId(3L);
        author.setNombre("Eric Evans");

        Book book = new Book();
        book.setId(bookId);
        book.setTitulo("Viejo título");
        book.setAutor(author);
        book.setDisponible(true);

        BookRequestData request = new BookRequestData();
        request.setTitulo("Nuevo título");
        request.setAutorId(null);
        request.setDisponible(null);

        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bookRepository.findAll()).thenReturn(List.of(book));

        // Act
        BookResponse response = bookService.update(bookId, request);

        // Assert
        assertNotNull(response);
        assertEquals(bookId, response.getId());
        assertEquals("Nuevo título", response.getTitulo());
        assertEquals(3L, response.getAutorId());
        assertTrue(response.isDisponible());

        verify(bookRepository).findById(bookId);
        verify(bookRepository).save(any(Book.class));
        verify(authorRepository, never()).findById(any());
    }

    /**
     * PRUEBA 7: Actualizar libro inexistente
     */
    @Test
    void update_libroNoExiste_lanzaNotFoundException() {
        // Arrange
        Long bookId = 999L;

        BookRequestData request = new BookRequestData();
        request.setTitulo("X");

        when(bookRepository.findById(bookId)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> bookService.update(bookId, request));

        assertEquals("Libro no encontrado con id " + bookId, ex.getMessage());
        verify(bookRepository, never()).save(any(Book.class));
    }

    /**
     * PRUEBA 8A: Actualizar autor cuando autorId viene y existe
     */
    @Test
    void update_autorIdVieneYExiste_actualizaAutor() {
        // Arrange
        Long bookId = 1L;

        Author oldAuthor = new Author();
        oldAuthor.setId(1L);
        oldAuthor.setNombre("Autor Viejo");

        Book book = new Book();
        book.setId(bookId);
        book.setTitulo("Libro");
        book.setAutor(oldAuthor);
        book.setDisponible(true);

        Long newAutorId = 2L;
        Author newAuthor = new Author();
        newAuthor.setId(newAutorId);
        newAuthor.setNombre("Autor Nuevo");

        BookRequestData request = new BookRequestData();
        request.setTitulo("Libro");
        request.setAutorId(newAutorId);

        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));
        when(authorRepository.findById(newAutorId)).thenReturn(Optional.of(newAuthor));
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bookRepository.findAll()).thenReturn(List.of(book));

        // Act
        BookResponse response = bookService.update(bookId, request);

        // Assert
        assertEquals(newAutorId, response.getAutorId());
        assertEquals("Autor Nuevo", response.getAutorNombre());

        verify(authorRepository).findById(newAutorId);
        verify(bookRepository).save(any(Book.class));
    }

    /**
     * PRUEBA 8B: Actualizar autor cuando autorId viene y NO existe
     */
    @Test
    void update_autorIdVienePeroNoExiste_lanzaNotFoundException() {
        // Arrange
        Long bookId = 1L;

        Author oldAuthor = new Author();
        oldAuthor.setId(1L);
        oldAuthor.setNombre("Autor Viejo");

        Book book = new Book();
        book.setId(bookId);
        book.setTitulo("Libro");
        book.setAutor(oldAuthor);
        book.setDisponible(true);

        Long newAutorId = 999L;

        BookRequestData request = new BookRequestData();
        request.setTitulo("Libro");
        request.setAutorId(newAutorId);

        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));
        when(authorRepository.findById(newAutorId)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> bookService.update(bookId, request));

        assertEquals("Autor no encontrado con id " + newAutorId, ex.getMessage());
        verify(bookRepository, never()).save(any(Book.class));
    }


}
