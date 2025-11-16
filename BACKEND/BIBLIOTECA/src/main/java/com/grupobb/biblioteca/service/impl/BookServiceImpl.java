package com.grupobb.biblioteca.service.impl;

import com.grupobb.biblioteca.domain.Book;
import com.grupobb.biblioteca.repository.BookRepository;
import com.grupobb.biblioteca.service.BookService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookServiceImpl implements BookService {

    private final BookRepository repository;

    public BookServiceImpl(BookRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Book> findAll() {
        return repository.findAll();
    }

    @Override
    public Book findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));
    }

    @Override
    public Book create(Book book) {
        return repository.save(book);
    }

    @Override
    public Book update(Long id, Book in) {
        Book b = findById(id);
        b.setTitulo(in.getTitulo());
        b.setAutor(in.getAutor());
        b.setDisponible(in.isDisponible());
        return repository.save(b);
    }

    @Override
    public void delete(Long id) {
        repository.delete(findById(id));
    }
}
