package com.example.app.common;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    ResponseEntity<ApiResponse<Void>> handleApp(AppException e) {
        return respond(e.getStatus(), e.getCode(), e.getMessage(), null);
    }

    /** @Valid @RequestBody failures. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleBody(MethodArgumentNotValidException e) {
        Map<String, List<String>> details = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(fe ->
                details.computeIfAbsent(fe.getField(), k -> new ArrayList<>()).add(fe.getDefaultMessage()));
        return validation(details);
    }

    /** Constraint annotations on @RequestParam / @PathVariable (e.g. @Max on limit). */
    @ExceptionHandler(HandlerMethodValidationException.class)
    ResponseEntity<ApiResponse<Void>> handleParams(HandlerMethodValidationException e) {
        Map<String, List<String>> details = new LinkedHashMap<>();
        e.getAllValidationResults().forEach(r -> details.put(
                r.getMethodParameter().getParameterName(),
                r.getResolvableErrors().stream().map(MessageSourceResolvable::getDefaultMessage).toList()));
        return validation(details);
    }

    /** e.g. a non-UUID path variable. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        return validation(Map.of(e.getName(), List.of("invalid value")));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiResponse<Void>> handleUnreadable(HttpMessageNotReadableException e) {
        return validation(Map.of("body", List.of("invalid JSON")));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>> handleOther(Exception e) {
        // Spring MVC's own exceptions (404 no route, 405, 415 ...) carry their HTTP status.
        if (e instanceof ErrorResponse er) {
            HttpStatus status = HttpStatus.valueOf(er.getStatusCode().value());
            String code = status == HttpStatus.BAD_REQUEST ? "VALIDATION_ERROR" : status.name();
            return respond(status, code, er.getBody().getDetail(), null);
        }
        log.error("unhandled error", e);
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Internal server error", null);
    }

    private ResponseEntity<ApiResponse<Void>> validation(Object details) {
        return respond(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Invalid request parameters", details);
    }

    private ResponseEntity<ApiResponse<Void>> respond(HttpStatus status, String code, String message, Object details) {
        String language = null;
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
            language = attrs.getRequest().getHeader(HttpHeaders.ACCEPT_LANGUAGE);
        }
        return ResponseEntity.status(status)
                .body(ApiResponse.error(code, Messages.localize(code, language, message), details));
    }
}
