package com.grupobb.biblioteca.service.impl;

import com.grupobb.biblioteca.domain.User;
import com.grupobb.biblioteca.dto.User.UserRequestData;
import com.grupobb.biblioteca.dto.User.UserResponseData;
import com.grupobb.biblioteca.repository.LoanRepository;
import com.grupobb.biblioteca.repository.UserRepository;
import com.grupobb.biblioteca.service.UserService;
import com.grupobb.biblioteca.web.advice.BadRequestException;
import com.grupobb.biblioteca.web.advice.ConflictException;
import com.grupobb.biblioteca.web.advice.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repo;
    private final LoanRepository loanRepository;

    public UserServiceImpl(UserRepository repo, LoanRepository loanRepository) {
        this.repo = repo;
        this.loanRepository = loanRepository;
    }

    @Override
    @Transactional
    public UserResponseData create(UserRequestData request) {

        // Validar email único
        if (repo.existsByEmail(request.getEmail())) {
            throw new ConflictException("El email ya está registrado");
        }

        User user = new User();
        user.setNombre(request.getNombre());
        user.setEmail(request.getEmail());

        User saved = repo.save(user);

        return toResponse(saved);
    }

    @Override
    public UserResponseData getById(Long id) {
        User user = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        return toResponse(user);
    }

    @Override
    public List<UserResponseData> list() {
        return repo.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserResponseData update(Long id, UserRequestData request) {

        User user = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Validar email único si cambia
        if (!user.getEmail().equals(request.getEmail())
                && repo.existsByEmail(request.getEmail())) {
            throw new ConflictException("El email ya está en uso");
        }

        user.setNombre(request.getNombre());
        user.setEmail(request.getEmail());

        User updated = repo.save(user);

        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {

        User user = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Validar que no tenga préstamos activos
        if (loanRepository.existsByUsuarioAndFechaDevolucionIsNull(user)) {
            throw new BadRequestException("No se puede eliminar el usuario porque tiene préstamos activos");
        }

        repo.delete(user);
    }

    private UserResponseData toResponse(User user) {
        UserResponseData dto = new UserResponseData();
        dto.setId(user.getId());
        dto.setNombre(user.getNombre());
        dto.setEmail(user.getEmail());
        return dto;
    }
}
