package com.example.store_manager.utility;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public final class ResultResponseMapper {

    private ResultResponseMapper() {
    }

    public static <T> ResponseEntity<?> toResponse(Result<T> result) {
        if (result.isOk()) {
            return ResponseEntity.ok(result.get());
        }

        ApiError error = result.error();

        HttpStatus status = switch (error.code()) {
            case "NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "FORBIDDEN" -> HttpStatus.FORBIDDEN;
            case "BAD_REQUEST" -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };

        return ResponseEntity.status(status).body(error);
    }
}
