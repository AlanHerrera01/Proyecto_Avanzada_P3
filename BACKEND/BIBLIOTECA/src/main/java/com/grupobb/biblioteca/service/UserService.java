package com.grupobb.biblioteca.service;

import com.grupobb.biblioteca.dto.User.UserRequestData;
import com.grupobb.biblioteca.dto.User.UserResponseData;

import java.util.List;

public interface UserService {

    UserResponseData create(UserRequestData request);

    UserResponseData getById(Long id);

    List<UserResponseData> list();

    UserResponseData update(Long id, UserRequestData request);

    void delete(Long id);
}
