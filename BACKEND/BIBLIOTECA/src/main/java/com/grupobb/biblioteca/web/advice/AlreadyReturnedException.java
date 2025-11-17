package com.grupobb.biblioteca.web.advice;

public class AlreadyReturnedException extends RuntimeException {

    public AlreadyReturnedException(String message) {
        super(message);
    }
}
