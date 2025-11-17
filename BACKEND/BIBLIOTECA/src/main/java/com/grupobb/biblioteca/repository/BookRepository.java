package com.grupobb.biblioteca.repository;

import com.grupobb.biblioteca.domain.Author;
import com.grupobb.biblioteca.domain.Book;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio Spring Data para la entidad Book.
 * Provee métodos CRUD y puede ser extendido con consultas personalizadas si se necesita.
 */
public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByAutor(Author autor);
}
