package com.grupobb.biblioteca.service.impl;

import com.grupobb.biblioteca.domain.Author;
import com.grupobb.biblioteca.dto.Author.AuthorRequestData;
import com.grupobb.biblioteca.dto.Author.AuthorResponse;
import com.grupobb.biblioteca.repository.AuthorRepository;
import com.grupobb.biblioteca.repository.BookRepository;
import com.grupobb.biblioteca.service.AuthorService;
import com.grupobb.biblioteca.web.advice.BadRequestException;
import com.grupobb.biblioteca.web.advice.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository repository;
    private final BookRepository bookRepository;

    public AuthorServiceImpl(AuthorRepository repository, BookRepository bookRepository) {
        this.repository = repository;
        this.bookRepository = bookRepository;
    }

    @Override
    public List<AuthorResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AuthorResponse findById(Long id) {
        Author author = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Autor no encontrado con id " + id));
        return toResponse(author);
    }

    @Override
    @Transactional
    public AuthorResponse create(AuthorRequestData request) {
        Author author = new Author();
        author.setNombre(request.getNombre());
        author.setNacionalidad(request.getNacionalidad());
        Author saved = repository.save(author);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public AuthorResponse update(Long id, AuthorRequestData request) {
        Author author = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Autor no encontrado con id " + id));

        author.setNombre(request.getNombre());
        author.setNacionalidad(request.getNacionalidad());

        Author updated = repository.save(author);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Author author = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Autor no encontrado con id " + id));
        
        // Validar que no tenga libros asociados
        if (bookRepository.existsByAutor(author)) {
            throw new BadRequestException("No se puede eliminar el autor porque tiene libros asociados");
        }
        
        repository.deleteById(id);
    }

    // Mapper privado: Entity -> DTO
    private AuthorResponse toResponse(Author author) {
        AuthorResponse dto = new AuthorResponse();
        dto.setId(author.getId());
        dto.setNombre(author.getNombre());
        dto.setNacionalidad(author.getNacionalidad());
        return dto;
    }
}
