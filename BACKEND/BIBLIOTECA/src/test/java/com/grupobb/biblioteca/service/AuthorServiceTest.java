package com.grupobb.biblioteca.service;

import com.grupobb.biblioteca.domain.Author;
import com.grupobb.biblioteca.dto.Author.AuthorRequestData;
import com.grupobb.biblioteca.dto.Author.AuthorResponse;
import com.grupobb.biblioteca.repository.AuthorRepository;
import com.grupobb.biblioteca.repository.BookRepository;
import com.grupobb.biblioteca.service.impl.AuthorServiceImpl;
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
 * Pruebas unitarias para AuthorService usando Mockito.
 *
 * Cobertura:
 * 1. Listar autores (mapea DTO)
 * 2. Obtener autor por ID existente
 * 3. Obtener autor por ID inexistente
 * 4. Crear autor (guarda y retorna DTO)
 * 5. Actualizar autor existente
 * 6. Actualizar autor inexistente
 * 7. Eliminar autor sin libros asociados
 * 8. Eliminar autor con libros asociados
 *
 * Patrón: AAA (Arrange-Act-Assert)
 */
public class AuthorServiceTest {

    private AuthorRepository authorRepository;
    private BookRepository bookRepository;

    private AuthorServiceImpl authorService;

    @BeforeEach
    void setUp() {
        authorRepository = mock(AuthorRepository.class);
        bookRepository = mock(BookRepository.class);

        authorService = new AuthorServiceImpl(authorRepository, bookRepository);
    }

    /**
     * PRUEBA 1: Listar autores
     * Objetivo: validar mapeo a AuthorResponse y retorno de lista.
     */
    @Test
    void findAll_retornaListaDeAutores() {
        // Arrange
        Author a1 = new Author();
        a1.setId(1L);
        a1.setNombre("Martin Fowler");
        a1.setNacionalidad("UK");

        Author a2 = new Author();
        a2.setId(2L);
        a2.setNombre("Robert C. Martin");
        a2.setNacionalidad("USA");

        when(authorRepository.findAll()).thenReturn(List.of(a1, a2));

        // Act
        List<AuthorResponse> response = authorService.findAll();

        // Assert
        assertNotNull(response);
        assertEquals(2, response.size());

        assertEquals(1L, response.get(0).getId());
        assertEquals("Martin Fowler", response.get(0).getNombre());
        assertEquals("UK", response.get(0).getNacionalidad());

        assertEquals(2L, response.get(1).getId());
        assertEquals("Robert C. Martin", response.get(1).getNombre());
        assertEquals("USA", response.get(1).getNacionalidad());

        verify(authorRepository).findAll();
    }

    /**
     * PRUEBA 2: Obtener autor por ID existente
     */
    @Test
    void findById_idExistente_retornaAutor() {
        // Arrange
        Long authorId = 1L;

        Author author = new Author();
        author.setId(authorId);
        author.setNombre("Kent Beck");
        author.setNacionalidad("USA");

        when(authorRepository.findById(authorId)).thenReturn(Optional.of(author));

        // Act
        AuthorResponse response = authorService.findById(authorId);

        // Assert
        assertNotNull(response);
        assertEquals(authorId, response.getId());
        assertEquals("Kent Beck", response.getNombre());
        assertEquals("USA", response.getNacionalidad());

        verify(authorRepository).findById(authorId);
    }

    /**
     * PRUEBA 3: Obtener autor por ID inexistente
     */
    @Test
    void findById_idNoExistente_lanzaNotFoundException() {
        // Arrange
        Long authorId = 999L;
        when(authorRepository.findById(authorId)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> authorService.findById(authorId));

        assertEquals("Autor no encontrado con id " + authorId, ex.getMessage());
        verify(authorRepository).findById(authorId);
    }

    /**
     * PRUEBA 4: Crear autor
     */
    @Test
    void create_retornaAutorCreado() {
        // Arrange
        AuthorRequestData request = new AuthorRequestData();
        request.setNombre("Eric Evans");
        request.setNacionalidad("USA");

        Author saved = new Author();
        saved.setId(10L);
        saved.setNombre("Eric Evans");
        saved.setNacionalidad("USA");

        when(authorRepository.save(any(Author.class))).thenReturn(saved);
        // IMPORTANTE: create() dispara ejecutarAnalisisReactivo(repository.findAll())
        when(authorRepository.findAll()).thenReturn(List.of(saved));

        // Act
        AuthorResponse response = authorService.create(request);

        // Assert
        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Eric Evans", response.getNombre());
        assertEquals("USA", response.getNacionalidad());

        verify(authorRepository).save(any(Author.class));
        verify(authorRepository, atLeastOnce()).findAll();
    }

    /**
     * PRUEBA 5: Actualizar autor existente
     */
    @Test
    void update_autorExiste_actualizaCorrectamente() {
        // Arrange
        Long authorId = 1L;

        Author author = new Author();
        author.setId(authorId);
        author.setNombre("Nombre viejo");
        author.setNacionalidad("EC");

        AuthorRequestData request = new AuthorRequestData();
        request.setNombre("Nombre nuevo");
        request.setNacionalidad("USA");

        when(authorRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(authorRepository.save(any(Author.class))).thenAnswer(inv -> inv.getArgument(0));
        // update() dispara ejecutarAnalisisReactivo(repository.findAll())
        when(authorRepository.findAll()).thenReturn(List.of(author));

        // Act
        AuthorResponse response = authorService.update(authorId, request);

        // Assert
        assertNotNull(response);
        assertEquals(authorId, response.getId());
        assertEquals("Nombre nuevo", response.getNombre());
        assertEquals("USA", response.getNacionalidad());

        verify(authorRepository).findById(authorId);
        verify(authorRepository).save(any(Author.class));
        verify(authorRepository, atLeastOnce()).findAll();
    }

    /**
     * PRUEBA 6: Actualizar autor inexistente
     */
    @Test
    void update_autorNoExiste_lanzaNotFoundException() {
        // Arrange
        Long authorId = 999L;

        AuthorRequestData request = new AuthorRequestData();
        request.setNombre("X");
        request.setNacionalidad("Y");

        when(authorRepository.findById(authorId)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> authorService.update(authorId, request));

        assertEquals("Autor no encontrado con id " + authorId, ex.getMessage());
        verify(authorRepository, never()).save(any());
    }

    /**
     * PRUEBA 7: Eliminar autor sin libros asociados
     */
    @Test
    void delete_autorSinLibros_eliminaCorrectamente() {
        // Arrange
        Long authorId = 1L;

        Author author = new Author();
        author.setId(authorId);

        when(authorRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(bookRepository.existsByAutor(author)).thenReturn(false);
        // delete() dispara ejecutarAnalisisReactivo(repository.findAll())
        when(authorRepository.findAll()).thenReturn(List.of(author));

        // Act
        assertDoesNotThrow(() -> authorService.delete(authorId));

        // Assert
        verify(authorRepository).deleteById(authorId);
        verify(bookRepository).existsByAutor(author);
        verify(authorRepository, atLeastOnce()).findAll();
    }

    /**
     * PRUEBA 8: Eliminar autor con libros asociados
     */
    @Test
    void delete_autorConLibros_lanzaBadRequestException() {
        // Arrange
        Long authorId = 1L;

        Author author = new Author();
        author.setId(authorId);

        when(authorRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(bookRepository.existsByAutor(author)).thenReturn(true);

        // Act & Assert
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> authorService.delete(authorId));

        assertEquals("No se puede eliminar el autor porque tiene libros asociados", ex.getMessage());
        verify(authorRepository, never()).deleteById(any());
    }
}
