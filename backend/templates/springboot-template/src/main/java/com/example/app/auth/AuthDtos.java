package com.example.app.auth;

import com.example.app.user.UserDtos.UserResponse;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 50) String name,
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 8, max = 72) String password) {
        public RegisterRequest {
            name = name == null ? null : name.trim();
            email = email == null ? null : email.trim().toLowerCase();
        }
    }

    /** Password rules are not enforced here, so a wrong password yields INVALID_CREDENTIALS. */
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
        public LoginRequest {
            email = email == null ? null : email.trim().toLowerCase();
        }
    }

    public record Session(UserResponse user, String accessToken) {}

    /** Session plus the raw refresh token destined for the cookie (never serialized). */
    public record IssuedSession(Session session, String refreshToken) {}
}
