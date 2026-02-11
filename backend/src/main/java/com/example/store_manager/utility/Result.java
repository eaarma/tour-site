package com.example.store_manager.utility;

import java.util.Objects;
import java.util.function.Function;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public final class Result<T> {

    private final T value;
    private final ApiError error;

    private Result(T value, ApiError error) {
        this.value = value;
        this.error = error;
    }

    public static <T> Result<T> ok(T value) {
        return new Result<>(Objects.requireNonNull(value), null);
    }

    public static <T> Result<T> fail(ApiError error) {
        return new Result<>(null, Objects.requireNonNull(error));
    }

    // === Serialization-friendly getters ===

    public boolean isOk() {
        return error == null;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public T getValue() {
        return value;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public ApiError error() {
        return error;
    }

    // === Domain safety API (ignored by Jackson) ===

    @JsonIgnore
    public boolean isFail() {
        return error != null;
    }

    @JsonIgnore
    public T get() {
        if (isFail()) {
            throw new IllegalStateException(
                    "Tried to get() from failed Result: " + error);
        }
        return value;
    }

    @JsonIgnore
    public ApiError getErrorOrThrow() {
        if (isOk()) {
            throw new IllegalStateException(
                    "Tried to get error from successful Result");
        }
        return error;
    }

    @JsonIgnore
    public <U> Result<U> map(Function<T, U> mapper) {
        return isOk()
                ? Result.ok(mapper.apply(value))
                : Result.fail(error);
    }
}
