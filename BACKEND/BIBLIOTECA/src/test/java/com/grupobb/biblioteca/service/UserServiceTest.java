package com.grupobb.biblioteca.service;


import com.grupobb.biblioteca.domain.User;
import com.grupobb.biblioteca.dto.User.UserRequestData;
import com.grupobb.biblioteca.repository.UserRepository;
import com.grupobb.biblioteca.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DataJpaTest
@Import({UserServiceImpl.class})
public class UserServiceTest {
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldCreateUserSuccessfully() {
        User existingUser = new User();
        existingUser.setNombre("Existing User");
        existingUser.setEmail("duplicate@example.com");

        userRepository.save(existingUser);

        UserRequestData req = new UserRequestData();
        req.setNombre("Existing User");
        req.setEmail("duplicate@example.com");
    }
}