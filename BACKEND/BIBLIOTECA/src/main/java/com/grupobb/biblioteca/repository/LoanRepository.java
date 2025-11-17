package com.grupobb.biblioteca.repository;

import com.grupobb.biblioteca.domain.Book;
import com.grupobb.biblioteca.domain.Loan;
import com.grupobb.biblioteca.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio para la entidad Loan (prestamos).
 */
public interface LoanRepository extends JpaRepository<Loan, Long> {
    boolean existsByUsuarioAndFechaDevolucionIsNull(User usuario);
    boolean existsByLibroAndFechaDevolucionIsNull(Book libro);
}
