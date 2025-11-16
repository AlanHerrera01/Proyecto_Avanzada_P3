package com.grupobb.biblioteca.controller;

import com.grupobb.biblioteca.domain.Book;
import com.grupobb.biblioteca.repository.BookRepository;
import com.grupobb.biblioteca.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para operaciones CRUD sobre libros.
 *
 * Rutas base: /api/books
 * - GET /api/books           -> lista todos los libros (incluye campo 'disponible')
 * - GET /api/books/{id}      -> obtiene un libro por id
 * - POST /api/books          -> crea un nuevo libro (envía JSON con titulo y autor)
 * - PUT /api/books/{id}      -> actualiza un libro existente
 * - DELETE /api/books/{id}   -> elimina un libro
 */
@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public List<Book> list() {
        return bookService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> get(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.findById(id));
    }

    @PostMapping
    public Book create(@RequestBody Book book) {
        return bookService.create(book);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> update(@PathVariable Long id, @RequestBody Book book) {
        return ResponseEntity.ok(bookService.update(id, book));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

