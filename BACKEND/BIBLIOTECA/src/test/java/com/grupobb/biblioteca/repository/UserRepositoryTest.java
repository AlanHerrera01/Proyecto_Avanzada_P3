package com.grupobb.biblioteca.repository;

import com.grupobb.biblioteca.domain.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DataJpaTest
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveUserByEmail(){
        User u = new User();
        u.setNombre("Test User");
        u.setEmail("test@example.com");

        userRepository.save(u);

        var result= userRepository.findByEmail("test@example.com");
        assertThat(result.isPresent());
        assertThat(result.get().getNombre()).isEqualTo("Test User");

    }
}
