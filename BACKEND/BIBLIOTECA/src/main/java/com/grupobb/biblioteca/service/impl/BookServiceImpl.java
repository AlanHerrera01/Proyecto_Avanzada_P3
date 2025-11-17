package com.grupobb.biblioteca.service.impl;

import com.grupobb.biblioteca.domain.Author;
import com.grupobb.biblioteca.domain.Book;
import com.grupobb.biblioteca.dto.Book.BookRequestData;
import com.grupobb.biblioteca.dto.Book.BookResponse;
import com.grupobb.biblioteca.repository.AuthorRepository;
import com.grupobb.biblioteca.repository.BookRepository;
import com.grupobb.biblioteca.repository.LoanRepository;
import com.grupobb.biblioteca.service.BookService;
import com.grupobb.biblioteca.web.advice.BadRequestException;
import com.grupobb.biblioteca.web.advice.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final LoanRepository loanRepository;

    public BookServiceImpl(BookRepository bookRepository,
                           AuthorRepository authorRepository,
                           LoanRepository loanRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.loanRepository = loanRepository;
    }

    @Override
    public List<BookResponse> findAll() {
        return bookRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public BookResponse findById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Libro no encontrado con id " + id));
        return toResponse(book);
    }

    @Override
    @Transactional
    public BookResponse create(BookRequestData request) {
        Author autor = authorRepository.findById(request.getAutorId())
                .orElseThrow(() -> new NotFoundException("Autor no encontrado con id " + request.getAutorId()));

        Book book = new Book();
        book.setTitulo(request.getTitulo());
        book.setAutor(autor);
        // si viene null, por defecto true
        book.setDisponible(request.getDisponible() != null ? request.getDisponible() : true);

        Book saved = bookRepository.save(book);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public BookResponse update(Long id, BookRequestData request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Libro no encontrado con id " + id));

        book.setTitulo(request.getTitulo());

        if (request.getAutorId() != null) {
            Author autor = authorRepository.findById(request.getAutorId())
                    .orElseThrow(() -> new NotFoundException("Autor no encontrado con id " + request.getAutorId()));
            book.setAutor(autor);
        }

        if (request.getDisponible() != null) {
            book.setDisponible(request.getDisponible());
        }

        Book updated = bookRepository.save(book);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Libro no encontrado con id " + id));
        
        // Validar que no tenga préstamos activos
        if (loanRepository.existsByLibroAndFechaDevolucionIsNull(book)) {
            throw new BadRequestException("No se puede eliminar el libro porque tiene préstamos activos");
        }
        
        bookRepository.deleteById(id);
    }

    // Mapper privado: Entity -> DTO
    private BookResponse toResponse(Book book) {
        BookResponse dto = new BookResponse();
        dto.setId(book.getId());
        dto.setTitulo(book.getTitulo());
        if (book.getAutor() != null) {
            dto.setAutorId(book.getAutor().getId());
            dto.setAutorNombre(book.getAutor().getNombre());
        }
        dto.setDisponible(book.isDisponible());
        return dto;
    }
}
