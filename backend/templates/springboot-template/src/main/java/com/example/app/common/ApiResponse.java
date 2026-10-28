package com.example.app.common;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Unified response body (see docs/API_CONTRACT.md).
 * Success: { code: 0, message: "success", data }. Error: { code: "ERROR_CODE", message, data: null, details? }.
 */
public record ApiResponse<T>(
        Object code,
        String message,
        T data,
        @JsonInclude(JsonInclude.Include.NON_NULL) Object details) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(0, "success", data, null);
    }

    public static ApiResponse<Void> error(String code, String message, Object details) {
        return new ApiResponse<>(code, message, null, details);
    }
}
