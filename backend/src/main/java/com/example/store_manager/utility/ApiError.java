package com.example.store_manager.utility;

public record ApiError(String code, String message) {

    public boolean isNotFound() {
        return "NOT_FOUND".equals(code);
    }

    public boolean isBadRequest() {
        return "BAD_REQUEST".equals(code);
    }

    public boolean isForbidden() {
        return "FORBIDDEN".equals(code);
    }

    public static ApiError notFound(String message) {
        return new ApiError("NOT_FOUND", message);
    }

    public static ApiError badRequest(String message) {
        return new ApiError("BAD_REQUEST", message);
    }

    public static ApiError forbidden(String message) {
        return new ApiError("FORBIDDEN", message);
    }

    public static ApiError internal(String message) {
        return new ApiError("INTERNAL", message);
    }
}
