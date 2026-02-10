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

    /**
     * PRUEBA 5: Actualizar un usuario.
     * El mock de existsByEmail debe ser false para que permita el cambio.
     */
    @Test
    void update_datosValidos_retornaUsuarioActualizado() {
        // Arrange
        Long userId = 1L;
        UserRequestData request = new UserRequestData();
        request.setNombre("Nombre Actualizado");
        request.setEmail("nuevo.email@example.com"); // Email nuevo

        User userExistente = new User();
        userExistente.setId(userId);
        userExistente.setEmail("viejo.email@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(userExistente));

        // IMPORTANTE: Decimos que el NUEVO email no existe en la BD
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);

        // Simulamos que el save devuelve el objeto con los cambios aplicados
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        UserResponseData response = userService.update(userId, request);

        // Assert
        assertEquals("Nombre Actualizado", response.getNombre());
        assertEquals("nuevo.email@example.com", response.getEmail());
        verify(userRepository).save(any(User.class));
    }

    /**
     * PRUEBA 6: Error por email duplicado.
     * Aquí simulamos que el email que intentamos poner ya lo tiene OTRA persona.
     */
    @Test
    void update_emailEnUso_lanzaConflictException() {
        // Arrange
        Long userId = 1L;
        UserRequestData request = new UserRequestData();
        request.setEmail("email.de.otro@example.com"); // Este email ya existe

        User userExistente = new User();
        userExistente.setId(userId);
        userExistente.setEmail("mi.email.actual@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(userExistente));

        // SIMULAMOS EL CONFLICTO: existsByEmail devuelve TRUE
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(ConflictException.class, () -> {
            userService.update(userId, request);
        });

        // Verificamos que no se guardó nada por el error de duplicado
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * PRUEBA 7: Eliminar un usuario sin préstamos activos.
     * Aquí simulamos que el usuario existe y que no tiene préstamos activos, por lo que el servicio debería permitir eliminarlo sin lanzar excepciones, y el repositorio debería ejecutar el método delete
     */
    @Test
    void delete_usuarioSinPrestamosActivos_eliminaCorrectamente() {
        // ARRANGE
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        // Simulamos: "El usuario NO tiene libros pendientes (false)"
        when(loanRepository.existsByUsuarioAndFechaDevolucionIsNull(user)).thenReturn(false);

        // ACT
        assertDoesNotThrow(() -> userService.delete(userId));

        // ASSERT: Verificamos que el repositorio efectivamente ejecutó el borrado
        verify(userRepository).delete(user);
    }

    /**
     * PRUEBA 8: Eliminar un usuario con préstamos activos.
     * Aquí simulamos que el usuario existe pero tiene préstamos activos, por lo que el servicio
     */
    @Test
    void delete_usuarioConPrestamosActivos_lanzaBadRequestException() {
        // ARRANGE
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        // Simulamos: "El usuario SI tiene libros pendientes (true)"
        when(loanRepository.existsByUsuarioAndFechaDevolucionIsNull(user)).thenReturn(true);

        // ACT & ASSERT: Debería fallar porque no se puede borrar a alguien con deudas
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.delete(userId);
        });

        assertEquals("No se puede eliminar el usuario porque tiene préstamos activos", ex.getMessage());
        // Verificamos que NUNCA se llamó al borrado
        verify(userRepository, never()).delete(any(User.class));
    }
}