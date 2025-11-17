package com.grupobb.biblioteca.dto.Author;

import jakarta.validation.constraints.NotBlank;

public class AuthorRequestData {

    @NotBlank(message = "El nombre del autor es obligatorio")
    private String nombre;

    // Nacionalidad opcional aunque se puede validar si es necesario
    private String nacionalidad;
    //siempre
    public String getNombre() {
        return nombre;
    }
    //siempre
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getNacionalidad() {
        return nacionalidad;
    }

    public void setNacionalidad(String nacionalidad) {
        this.nacionalidad = nacionalidad;
    }
}
