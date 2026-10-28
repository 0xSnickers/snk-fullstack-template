package com.example.app.auth;

import com.example.app.auth.AuthDtos.IssuedSession;
import com.example.app.auth.AuthDtos.LoginRequest;
import com.example.app.auth.AuthDtos.RegisterRequest;
import com.example.app.auth.AuthDtos.Session;
import com.example.app.common.AppException;
import com.example.app.security.JwtService;
import com.example.app.user.User;
import com.example.app.user.UserDtos.CreateUserRequest;
import com.example.app.user.UserDtos.UserResponse;
import com.example.app.user.UserService;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService users;
    private final JwtService jwt;
    private final RefreshTokenService refreshTokens;

    public AuthService(UserService users, JwtService jwt, RefreshTokenService refreshTokens) {
        this.users = users;
        this.jwt = jwt;
        this.refreshTokens = refreshTokens;
    }

    public IssuedSession register(RegisterRequest req) {
        UserResponse user = users.create(new CreateUserRequest(req.name(), req.email(), req.password(), User.ROLE_USER));
        return issue(user);
    }

    public IssuedSession login(LoginRequest req) {
        UserResponse user = users.verifyCredentials(req.email(), req.password())
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password"));
        return issue(user);
    }

    /** Refresh tokens are not rotated so that the Next.js BFF /auth/session flow keeps working. */
    public Session refresh(String refreshToken) {
        return Optional.ofNullable(refreshToken)
                .flatMap(refreshTokens::resolve)
                .flatMap(users::findById)
                .map(this::session)
                .orElseThrow(() -> AppException.unauthorized("Session expired"));
    }

    public void logout(String refreshToken) {
        if (refreshToken != null) {
            refreshTokens.revoke(refreshToken);
        }
    }

    private Session session(UserResponse user) {
        return new Session(user, jwt.sign(user.id(), user.role()));
    }

    private IssuedSession issue(UserResponse user) {
        return new IssuedSession(session(user), refreshTokens.issue(user.id()));
    }
}
