package com.grupobb.biblioteca.service;

import com.grupobb.biblioteca.domain.Author;
import java.util.List;

public interface AuthorService {
    List<Author> findAll();
    Author findById(Long id);
    Author create(Author author);
    Author update(Long id, Author author);
    void delete(Long id);
}
