package com.example.app.config;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** `app.*` settings from application.yml (backed by env vars, see .env.example). */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String jwtSecret,
        Duration accessTokenTtl,
        Duration refreshTokenTtl,
        boolean cookieSecure,
        boolean seedDemoUser,
        List<String> corsOrigins) {

    public AppProperties {
        if (jwtSecret == null || jwtSecret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 characters");
        }
        corsOrigins = corsOrigins == null ? List.of() : corsOrigins;
    }
}
