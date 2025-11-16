package com.grupobb.biblioteca.controller;

import com.grupobb.biblioteca.domain.Author;
import com.grupobb.biblioteca.repository.AuthorRepository;
import com.grupobb.biblioteca.service.AuthorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para operaciones CRUD sobre autores.
 *
 * Rutas base: /api/authors
 * - GET /api/authors           -> lista todos los autores
 * - GET /api/authors/{id}      -> obtiene un autor por id
 * - POST /api/authors          -> crea un nuevo autor (envía JSON con nombre y nacionalidad)
 * - PUT /api/authors/{id}      -> actualiza un autor existente
 * - DELETE /api/authors/{id}   -> elimina un autor
 */
@RestController
@RequestMapping("/api/authors")
public class AuthorController {

    private final AuthorService authorService;

    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    @GetMapping
    public List<Author> list() {
        return authorService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Author> get(@PathVariable Long id) {
        return ResponseEntity.ok(authorService.findById(id));
    }

    @PostMapping
    public Author create(@RequestBody Author author) {
        return authorService.create(author);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Author> update(@PathVariable Long id, @RequestBody Author author) {
        return ResponseEntity.ok(authorService.update(id, author));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        authorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

