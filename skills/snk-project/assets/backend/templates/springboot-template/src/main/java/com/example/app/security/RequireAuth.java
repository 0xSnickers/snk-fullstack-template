package com.example.app.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Requires `Authorization: Bearer <accessToken>`. Put it on a controller or a method;
 * a method-level annotation overrides the class-level one. Empty roles = any logged-in user.
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireAuth {
    String[] roles() default {};
}
