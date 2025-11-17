package com.grupobb.biblioteca.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Entidad JPA que representa la tabla `libros`.
 *
 * Campos:
 * - id: PK autogenerada
 * - titulo: título del libro
 * - autor: relación ManyToOne hacia `Author` (clave foránea `autor_id`)
 * - disponible: indicador si el libro está disponible para préstamo
 */
@Entity
@Table(name = "libros")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título no puede estar vacío")
    private String titulo;

    // Relación con Author; por simplicidad no usamos cascade aquí.
    @NotNull(message = "El autor es obligatorio")
    @ManyToOne
    @JoinColumn(name = "autor_id")
    private Author autor;

    // Verdadero si el libro puede ser prestado.
    private boolean disponible = true;

    public Book() {}

    // Getters y setters usados por JPA y Jackson.
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public Author getAutor() { return autor; }
    public void setAutor(Author autor) { this.autor = autor; }
    public boolean isDisponible() { return disponible; }
    public void setDisponible(boolean disponible) { this.disponible = disponible; }
}
