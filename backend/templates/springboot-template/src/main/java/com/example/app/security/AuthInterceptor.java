package com.example.app.security;

import com.example.app.common.AppException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/** Enforces {@link RequireAuth}; errors are rendered by GlobalExceptionHandler. */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtService jwt;

    public AuthInterceptor(JwtService jwt) {
        this.jwt = jwt;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        if (!(handler instanceof HandlerMethod method)) {
            return true;
        }
        RequireAuth rule = AnnotatedElementUtils.findMergedAnnotation(method.getMethod(), RequireAuth.class);
        if (rule == null) {
            rule = AnnotatedElementUtils.findMergedAnnotation(method.getBeanType(), RequireAuth.class);
        }
        if (rule == null) {
            return true;
        }

        String header = req.getHeader(HttpHeaders.AUTHORIZATION);
        AuthClaims claims = header != null && header.startsWith("Bearer ")
                ? jwt.verify(header.substring(7)).orElse(null)
                : null;
        if (claims == null) {
            throw AppException.unauthorized("Authentication required");
        }
        if (rule.roles().length > 0 && Arrays.stream(rule.roles()).noneMatch(claims.role()::equals)) {
            throw AppException.forbidden();
        }
        req.setAttribute(AuthClaims.ATTRIBUTE, claims);
        return true;
    }
}
