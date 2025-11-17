package com.grupobb.biblioteca.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Entidad JPA que representa la tabla `prestamos`.
 *
 * Esta entidad enlaza `usuarios` y `libros` y contiene fechas de préstamo y devolución.
 */
@Entity
@Table(name = "prestamos")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Usuario que realizó el préstamo (FK usuario_id).
    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private User usuario;

    // Libro prestado (FK libro_id).
    @NotNull(message = "El libro es obligatorio")
    @ManyToOne
    @JoinColumn(name = "libro_id")
    private Book libro;

    // Fecha en que se realizó el préstamo.
    @NotNull(message = "La fecha de préstamo es obligatoria")
    private LocalDate fechaPrestamo;

    // Fecha en que se devolvió el libro (null si aún no fue devuelto).
    private LocalDate fechaDevolucion;

    public Loan() {}

    // Getters y setters.
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUsuario() { return usuario; }
    public void setUsuario(User usuario) { this.usuario = usuario; }
    public Book getLibro() { return libro; }
    public void setLibro(Book libro) { this.libro = libro; }
    public LocalDate getFechaPrestamo() { return fechaPrestamo; }
    public void setFechaPrestamo(LocalDate fechaPrestamo) { this.fechaPrestamo = fechaPrestamo; }
    public LocalDate getFechaDevolucion() { return fechaDevolucion; }
    public void setFechaDevolucion(LocalDate fechaDevolucion) { this.fechaDevolucion = fechaDevolucion; }
}
