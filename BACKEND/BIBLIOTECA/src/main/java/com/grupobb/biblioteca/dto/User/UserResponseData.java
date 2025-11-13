package com.grupobb.biblioteca.dto.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserResponseData {

    @NotBlank @Size(min = 3, max = 120)
    private String Nombre;

    @NotBlank @Email @Size(max = 120)
    private String Email;

    public @NotBlank @Size(min = 3, max = 120) String getNombre() {
        return Nombre;
    }
    public void  setNombre(@NotBlank @Size(min = 3, max = 120)  String nombre) {
        Nombre = nombre;
    }
    public @NotBlank @Email @Size(max = 120) String getEmail() {
        return Email;
    }
    public void setEmail(@NotBlank @Email @Size(max = 120) String email) {
        Email = email;
    }

}
