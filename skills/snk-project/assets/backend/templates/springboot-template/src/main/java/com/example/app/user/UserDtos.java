package com.example.app.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

/** Request/response DTOs. Compact constructors normalize input before Bean Validation runs. */
public final class UserDtos {

    public static final String ROLE_PATTERN = "user|admin";

    private UserDtos() {}

    static String trim(String s) {
        return s == null ? null : s.trim();
    }

    static String normalizeEmail(String s) {
        return s == null ? null : s.trim().toLowerCase();
    }

    public record CreateUserRequest(
            @NotBlank @Size(min = 2, max = 50) String name,
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @Pattern(regexp = ROLE_PATTERN) String role) {
        public CreateUserRequest {
            name = trim(name);
            email = normalizeEmail(email);
            role = role == null ? User.ROLE_USER : role;
        }
    }

    public record UpdateUserRequest(
            @Size(min = 2, max = 50) String name,
            @Email @Size(max = 255) String email,
            @Pattern(regexp = ROLE_PATTERN) String role) {
        public UpdateUserRequest {
            name = trim(name);
            email = normalizeEmail(email);
        }
    }

    public record UserResponse(UUID id, String name, String email, String role, Instant createdAt, Instant updatedAt) {
        public static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt(), u.getUpdatedAt());
        }
    }
}
