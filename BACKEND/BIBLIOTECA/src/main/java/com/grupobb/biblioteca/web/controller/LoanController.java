package com.grupobb.biblioteca.web.controller;

import com.grupobb.biblioteca.domain.Loan;
import com.grupobb.biblioteca.dto.LoanRequest;
import com.grupobb.biblioteca.repository.LoanRepository;
import com.grupobb.biblioteca.service.LoanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador para gestionar préstamos (loans).
 *
 * Endpoints:
 * - GET /api/loans           -> lista préstamos
 * - POST /api/loans          -> crear préstamo (body: { usuarioId, libroId })
 * - POST /api/loans/{id}/return -> devolver préstamo (marca fecha_devolucion y libera el libro)
 */
@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;
    private final LoanRepository loanRepository;

    public LoanController(LoanService loanService, LoanRepository loanRepository) {
        this.loanService = loanService;
        this.loanRepository = loanRepository;
    }

    /**
     * Lista todos los préstamos.
     */
    @GetMapping
    public List<Loan> list() {
        return loanRepository.findAll();
    }

    /**
     * Crea un nuevo préstamo asociando un usuario y un libro.
     * Recibe un DTO con los ids y delega la lógica a LoanService.
     */
    @PostMapping
    public ResponseEntity<Loan> create(@RequestBody LoanRequest req) {
        Loan loan = loanService.createLoan(req.getUsuarioId(), req.getLibroId());
        return ResponseEntity.ok(loan);
    }

    /**
     * Marca un préstamo como devuelto y libera el libro asociado.
     */
    @PostMapping("/{id}/return")
    public ResponseEntity<Loan> devolver(@PathVariable Long id) {
        Loan loan = loanService.returnLoan(id);
        return ResponseEntity.ok(loan);
    }
}
