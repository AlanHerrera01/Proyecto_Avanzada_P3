package com.grupobb.biblioteca.repository;

import com.grupobb.biblioteca.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repositorio para la entidad User.
 * Incluye métodos para buscar por email y validar existencia.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
