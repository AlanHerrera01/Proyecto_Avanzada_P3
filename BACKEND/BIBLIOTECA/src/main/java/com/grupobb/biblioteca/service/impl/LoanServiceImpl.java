package com.grupobb.biblioteca.service.impl;

import com.grupobb.biblioteca.domain.Book;
import com.grupobb.biblioteca.domain.Loan;
import com.grupobb.biblioteca.domain.User;
import com.grupobb.biblioteca.dto.Loan.LoanRequestData;
import com.grupobb.biblioteca.dto.Loan.LoanResponse;
import com.grupobb.biblioteca.repository.BookRepository;
import com.grupobb.biblioteca.repository.LoanRepository;
import com.grupobb.biblioteca.repository.UserRepository;
import com.grupobb.biblioteca.service.LoanService;
import com.grupobb.biblioteca.web.advice.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public LoanServiceImpl(LoanRepository loanRepository,
                           UserRepository userRepository,
                           BookRepository bookRepository) {
        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    @Override
    @Transactional
    public LoanResponse createLoan(LoanRequestData request) {

        User user = userRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Book book = bookRepository.findById(request.getLibroId())
                .orElseThrow(() -> new NotFoundException("Libro no encontrado"));

        if (!book.isDisponible()) {
            throw new RuntimeException("El libro no está disponible");
        }

        Loan loan = new Loan();
        loan.setUsuario(user);
        loan.setLibro(book);
        loan.setFechaPrestamo(LocalDate.now());
        loan.setFechaDevolucion(null);

        book.setDisponible(false);
        bookRepository.save(book);

        Loan saved = loanRepository.save(loan);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public LoanResponse returnLoan(Long loanId) {

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new NotFoundException("Préstamo no encontrado"));

        if (loan.getFechaDevolucion() != null) {
            throw new RuntimeException("El libro ya fue devuelto");
        }

        loan.setFechaDevolucion(LocalDate.now());

        Book book = loan.getLibro();
        book.setDisponible(true);
        bookRepository.save(book);

        Loan updated = loanRepository.save(loan);

        return toResponse(updated);
    }

    @Override
    public List<LoanResponse> list() {
        return loanRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public LoanResponse getById(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new NotFoundException("Préstamo no encontrado"));
        return toResponse(loan);
    }

    private LoanResponse toResponse(Loan loan) {
        LoanResponse r = new LoanResponse();
        r.setId(loan.getId());
        r.setUsuarioNombre(loan.getUsuario().getNombre());
        r.setLibroTitulo(loan.getLibro().getTitulo());
        r.setFechaPrestamo(loan.getFechaPrestamo());
        r.setFechaDevolucion(loan.getFechaDevolucion());
        return r;
    }
}
