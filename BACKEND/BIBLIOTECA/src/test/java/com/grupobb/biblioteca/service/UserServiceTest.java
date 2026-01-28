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

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoanRepository loanRepository;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        // Inicializa los mocks anotados en esta clase de prueba
        MockitoAnnotations.openMocks(this);
    }

    /**
     * PRUEBA 1: Crear usuario con datos válidos.
     */
    @Test
    void crearUsuario_datosValidos_retornaUsuarioCreado() {
        // Arrange
        UserRequestData request = new UserRequestData();
        request.setNombre("Nuevo Usuario");
        request.setEmail("nuevo@example.com");

        User userGuardado = new User();
        userGuardado.setId(1L);
        userGuardado.setNombre(request.getNombre());
        userGuardado.setEmail(request.getEmail());

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(userGuardado);

        // Act
        UserResponseData response = userService.create(request);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Nuevo Usuario", response.getNombre());
        assertEquals("nuevo@example.com", response.getEmail());
        verify(userRepository).save(any(User.class));
    }

    /**
     * PRUEBA 2: Intentar crear usuario con un email que ya existe.
     */
    @Test
    void crearUsuario_emailDuplicado_lanzaConflictException() {
        // Arrange
        UserRequestData request = new UserRequestData();
        request.setNombre("Otro Usuario");
        request.setEmail("existente@example.com");

        when(userRepository.existsByEmail("existente@example.com")).thenReturn(true);

        // Act & Assert
        ConflictException ex = assertThrows(ConflictException.class, () -> {
            userService.create(request);
        });

        assertEquals("El email ya está registrado", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * PRUEBA 3: Obtener un usuario por un ID que sí existe.
     */
    @Test
    void getById_idExistente_retornaUsuario() {
        // Arrange
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        user.setNombre("Usuario Existente");
        user.setEmail("user@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        UserResponseData response = userService.getById(userId);

        // Assert
        assertNotNull(response);
        assertEquals(userId, response.getId());
        assertEquals("Usuario Existente", response.getNombre());
    }

    /**
     * PRUEBA 4: Intentar obtener un usuario con un ID que no existe.
     */
    @Test
    void getById_idNoExistente_lanzaNotFoundException() {
        // Arrange
        Long userId = 99L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException ex = assertThrows(NotFoundException.class, () -> {
            userService.getById(userId);
        });

        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    /**
     * PRUEBA 5: Actualizar un usuario existente con datos válidos.
     */
    @Test
    void update_datosValidos_retornaUsuarioActualizado() {
        // Arrange
        Long userId = 1L;
        UserRequestData request = new UserRequestData();
        request.setNombre("Nombre Actualizado");
        request.setEmail("email.actualizado@example.com");

        User userExistente = new User();
        userExistente.setId(userId);
        userExistente.setNombre("Nombre Original");
        userExistente.setEmail("email.original@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(userExistente));
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        UserResponseData response = userService.update(userId, request);

        // Assert
        assertNotNull(response);
        assertEquals("Nombre Actualizado", response.getNombre());
        assertEquals("email.actualizado@example.com", response.getEmail());
        verify(userRepository).save(any(User.class));
    }

    /**
     * PRUEBA 6: Intentar actualizar un usuario con un email que ya está en uso por otro.
     */
    @Test
    void update_emailEnUso_lanzaConflictException() {
        // Arrange
        Long userId = 1L;
        UserRequestData request = new UserRequestData();
        request.setNombre("Nombre");
        request.setEmail("email.enuso@example.com");

        User userExistente = new User();
        userExistente.setId(userId);
        userExistente.setEmail("email.original@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(userExistente));
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // Act & Assert
        ConflictException ex = assertThrows(ConflictException.class, () -> {
            userService.update(userId, request);
        });

        assertEquals("El email ya está en uso", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * PRUEBA 7: Eliminar un usuario que no tiene préstamos activos.
     */
    @Test
    void delete_usuarioSinPrestamosActivos_eliminaCorrectamente() {
        // Arrange
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(loanRepository.existsByUsuarioAndFechaDevolucionIsNull(user)).thenReturn(false);

        // Act
        assertDoesNotThrow(() -> userService.delete(userId));

        // Assert
        verify(userRepository).delete(user);
    }

    /**
     * PRUEBA 8: Intentar eliminar un usuario que tiene préstamos activos.
     */
    @Test
    void delete_usuarioConPrestamosActivos_lanzaBadRequestException() {
        // Arrange
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(loanRepository.existsByUsuarioAndFechaDevolucionIsNull(user)).thenReturn(true);

        // Act & Assert
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.delete(userId);
        });

        assertEquals("No se puede eliminar el usuario porque tiene préstamos activos", ex.getMessage());
        verify(userRepository, never()).delete(any(User.class));
    }
}
