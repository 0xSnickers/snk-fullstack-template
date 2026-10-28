package com.example.app.security;

import java.util.UUID;

/** Identity carried by a verified access token; available as request attribute {@link #ATTRIBUTE}. */
public record AuthClaims(UUID userId, String role) {
    public static final String ATTRIBUTE = "auth";
}
