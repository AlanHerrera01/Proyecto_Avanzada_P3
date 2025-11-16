package com.grupobb.biblioteca.service.impl;

import com.grupobb.biblioteca.domain.Author;
import com.grupobb.biblioteca.repository.AuthorRepository;
import com.grupobb.biblioteca.service.AuthorService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository repository;

    public AuthorServiceImpl(AuthorRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Author> findAll() {
        return repository.findAll();
    }

    @Override
    public Author findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Autor no encontrado"));
    }

    @Override
    public Author create(Author author) {
        return repository.save(author);
    }

    @Override
    public Author update(Long id, Author author) {
        Author a = findById(id);
        a.setNombre(author.getNombre());
        a.setNacionalidad(author.getNacionalidad());
        return repository.save(a);
    }

    @Override
    public void delete(Long id) {
        repository.delete(findById(id));
    }
}
