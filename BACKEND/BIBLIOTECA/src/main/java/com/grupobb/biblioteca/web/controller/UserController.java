package com.grupobb.biblioteca.web.controller;

import com.grupobb.biblioteca.dto.User.UserRequestData;
import com.grupobb.biblioteca.dto.User.UserResponseData;
import com.grupobb.biblioteca.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Crear usuario
    @PostMapping
    public ResponseEntity<UserResponseData> create(
            @Valid @RequestBody UserRequestData request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userService.create(request));
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseData> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    // Listar usuarios
    @GetMapping
    public ResponseEntity<List<UserResponseData>> list() {
        return ResponseEntity.ok(userService.list());
    }

    // Actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseData> update(
            @PathVariable Long id,
            @Valid @RequestBody UserRequestData request) {

        return ResponseEntity.ok(userService.update(id, request));
    }

    // Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
