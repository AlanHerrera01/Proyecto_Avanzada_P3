package com.grupobb.biblioteca.service;

import com.grupobb.biblioteca.domain.User;
import com.grupobb.biblioteca.dto.User.UserRequestData;
import com.grupobb.biblioteca.dto.User.UserResponseData;
import com.grupobb.biblioteca.repository.LoanRepository;
import com.grupobb.biblioteca.repository.UserRepository;
import com.grupobb.biblioteca.service.impl.UserServiceImpl;
import com.grupobb.biblioteca.web.advice.BadRequestException;
import com.grupobb.biblioteca.web.advice.ConflictException;
import com.grupobb.biblioteca.web.advice.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para UserService usando Mockito.
 *
 * Cobertura de casos:
 * 1. Crear usuario con datos válidos.
 * 2. Crear usuario con email duplicado.
 * 3. Obtener usuario por ID existente.
 * 4. Obtener usuario por ID inexistente.
 * 5. Actualizar usuario con datos válidos.
 * 6. Actualizar usuario con email duplicado.
 * 7. Eliminar usuario sin préstamos activos.
 * 8. Eliminar usuario con préstamos activos.
 *
 * Patrón: AAA (Arrange-Act-Assert)
 */


public class UserServiceTest {

    // @Mock crea un simulacro de las dependencias (no tocan la base de datos real)
    @Mock
    private UserRepository userRepository;

    @Mock
    private LoanRepository loanRepository;

    // @InjectMocks inserta los mocks de arriba dentro de la implementación del servicio
    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        // Antes de cada prueba, inicializa los objetos simulados
        MockitoAnnotations.openMocks(this);
    }

    /**
     * PRUEBA 1 : Crear un usuario con datos válidos.
     * Aquí simulamos que el email no existe y que el guardado se realiza correctamente, devolviendo un usuario con ID asignado.
     */
    @Test
    void crearUsuario_datosValidos_retornaUsuarioCreado() {
        // ARRANGE (Preparar): Configuramos los datos de entrada y el comportamiento esperado
        UserRequestData request = new UserRequestData();
        request.setNombre("Nuevo Usuario");
        request.setEmail("nuevo@example.com");

        User userGuardado = new User();
        userGuardado.setId(1L);
        userGuardado.setNombre(request.getNombre());
        userGuardado.setEmail(request.getEmail());

        // Simulamos: "Cuando pregunten si el email existe, di que NO"
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        // Simulamos: "Cuando guarden cualquier usuario, devuelve el objeto userGuardado"
        when(userRepository.save(any(User.class))).thenReturn(userGuardado);

        // ACT (Actuar): Llamamos al método real que queremos probar
        UserResponseData response = userService.create(request);

        // ASSERT (Verificar): Comprobamos que el resultado sea el esperado
        assertNotNull(response); // Que no sea nulo
        assertEquals(1L, response.getId()); // Que el ID sea 1
        assertEquals("Nuevo Usuario", response.getNombre());
        verify(userRepository).save(any(User.class)); // Verifica que se llamó al método save
    }

    /**
     * PRUEBA 2: Crear un usuario con email duplicado.
     * Aquí simulamos que el email ya existe en la base de datos, por lo que
     */
    @Test
    void crearUsuario_emailDuplicado_lanzaConflictException() {
        // ARRANGE
        UserRequestData request = new UserRequestData();
        request.setEmail("existente@example.com");

        // Simulamos: "Dile que el email SI existe"
        when(userRepository.existsByEmail("existente@example.com")).thenReturn(true);

        // ACT & ASSERT: Esperamos que al ejecutar el método se lance una excepción de conflicto
        ConflictException ex = assertThrows(ConflictException.class, () -> {
            userService.create(request);
        });

        assertEquals("El email ya está registrado", ex.getMessage());
        // Verificamos que NUNCA se intentó guardar en la base de datos
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * PRUEBA 3: Obtener un usuario por ID existente.
     * Aquí simulamos que el repositorio encuentra un usuario con el ID dado, devolviendo un Optional con el usuario dentro.
     */
    @Test
    void getById_idExistente_retornaUsuario() {
        // ARRANGE
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        user.setNombre("Usuario Existente");

        // Simulamos: "Cuando busquen este ID, devuelve un Optional con el usuario"
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // ACT
        UserResponseData response = userService.getById(userId);

        // ASSERT
        assertNotNull(response);
        assertEquals("Usuario Existente", response.getNombre());
    }

    /**
     * PRUEBA 4: Obtener un usuario por ID inexistente.
     * Aquí simulamos que el repositorio NO encuentra un usuario con el ID dado, devolviendo un Optional vacío, lo que debería hacer que el servicio lance una NotFoundException.
     */
    @Test
    void getById_idNoExistente_lanzaNotFoundException() {
        // ARRANGE
        Long userId = 99L;
        // Simulamos: "Cuando busquen este ID, devuelve un Optional vacío"
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(NotFoundException.class, () -> {
            userService.getById(userId);
        });
    }


}