package com.example.store_manager.utility;

import java.util.Objects;
import java.util.function.Function;

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

    public boolean isOk() {
        return error == null;
    }

    public boolean isFail() {
        return error != null;
    }

    public T get() {
        if (isFail())
            throw new IllegalStateException("Tried to get() from failed Result: " + error);
        return value;
    }

    public ApiError error() {
        return error;
    }

    // Optional helpers (nice DX later)
    public <U> Result<U> map(Function<T, U> mapper) {
        return isOk() ? Result.ok(mapper.apply(value)) : Result.fail(error);
    }
}
