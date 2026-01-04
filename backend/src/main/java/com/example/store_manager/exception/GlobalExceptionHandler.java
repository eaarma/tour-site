package com.example.store_manager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

@ControllerAdvice
public class GlobalExceptionHandler {

    /*
     * ===============================
     * VALIDATION (400)
     * ===============================
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex) {

        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.toList());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of("Validation failed", errors));
    }

    /*
     * ===============================
     * BAD REQUEST (400)
     * ===============================
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex) {

        return ResponseEntity
                .badRequest()
                .body(ErrorResponse.single("Bad request", ex.getMessage()));
    }

    /*
     * ===============================
     * AUTHENTICATION (401)
     * ===============================
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.single("Unauthorized", "Invalid credentials"));
    }

    /*
     * ===============================
     * AUTHORIZATION (403)
     * ===============================
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.single("Forbidden", ex.getMessage()));
    }

    /*
     * ===============================
     * NOT FOUND (404)
     * ===============================
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            NoSuchElementException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.single("Not found", ex.getMessage()));
    }

    /*
     * ===============================
     * FALLBACK (500)
     * ===============================
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.single(
                        "Internal server error",
                        "An unexpected error occurred"));
    }

    /*
     * ===============================
     * RESPONSE MODEL
     * ===============================
     */
    public record ErrorResponse(
            String error,
            List<String> messages) {
        public static ErrorResponse single(String error, String message) {
            return new ErrorResponse(error, List.of(message));
        }

        public static ErrorResponse of(String error, List<String> messages) {
            return new ErrorResponse(error, messages);
        }
    }
}
