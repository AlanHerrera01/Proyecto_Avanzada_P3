package com.grupobb.biblioteca.web.controller;

import com.grupobb.biblioteca.dto.Loan.LoanRequestData;
import com.grupobb.biblioteca.dto.Loan.LoanResponse;
import com.grupobb.biblioteca.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    // Crear préstamo
    @PostMapping
    public ResponseEntity<LoanResponse> create(
            @Valid @RequestBody LoanRequestData request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(loanService.createLoan(request));
    }

    // Listar todos los préstamos
    @GetMapping
    public ResponseEntity<List<LoanResponse>> list() {
        return ResponseEntity.ok(loanService.list());
    }

    // Obtener préstamo por ID
    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getById(id));
    }

    // Devolver libro
    @PostMapping("/{id}/return")
    public ResponseEntity<LoanResponse> returnLoan(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.returnLoan(id));
    }
}
