package com.grupobb.biblioteca.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Entidad JPA que representa la tabla `autores`.
 *
 * Campos:
 * - id: PK autogenerada
 * - nombre: nombre del autor (no nulo)
 * - nacionalidad: país/region del autor (opcional)
 */
@Entity
@Table(name = "autores")
public class Author {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre del autor. Validación básica con @NotBlank.
    @NotBlank(message = "El nombre del autor no puede estar vacío")
    private String nombre;

    // Nacionalidad (cadena libre).
    private String nacionalidad;

    public Author() {}

    // Getters y setters simples para JPA y uso por Jackson al serializar/deserializar.
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getNacionalidad() { return nacionalidad; }
    public void setNacionalidad(String nacionalidad) { this.nacionalidad = nacionalidad; }
}
