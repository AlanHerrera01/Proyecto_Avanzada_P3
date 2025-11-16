package com.grupobb.biblioteca.service;

import com.grupobb.biblioteca.domain.Book;
import java.util.List;

public interface BookService {
    List<Book> findAll();
    Book findById(Long id);
    Book create(Book book);
    Book update(Long id, Book book);
    void delete(Long id);
}
