package com.example.app.auth;

import com.example.app.auth.AuthDtos.IssuedSession;
import com.example.app.auth.AuthDtos.LoginRequest;
import com.example.app.auth.AuthDtos.RegisterRequest;
import com.example.app.auth.AuthDtos.Session;
import com.example.app.common.ApiResponse;
import com.example.app.config.AppProperties;
import com.example.app.security.AuthClaims;
import com.example.app.security.RequireAuth;
import com.example.app.user.UserDtos.UserResponse;
import com.example.app.user.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String COOKIE = "refresh_token";

    private final AuthService auth;
    private final UserService users;
    private final AppProperties props;

    public AuthController(AuthService auth, UserService users, AppProperties props) {
        this.auth = auth;
        this.users = users;
        this.props = props;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Session> register(@Valid @RequestBody RegisterRequest req, HttpServletResponse res) {
        return withCookie(res, auth.register(req));
    }

    @PostMapping("/login")
    public ApiResponse<Session> login(@Valid @RequestBody LoginRequest req, HttpServletResponse res) {
        return withCookie(res, auth.login(req));
    }

    @PostMapping({"/refresh", "/session"})
    public ApiResponse<Session> refresh(@CookieValue(name = COOKIE, required = false) String token) {
        return ApiResponse.ok(auth.refresh(token));
    }

    @PostMapping("/logout")
    public ApiResponse<Map<String, Boolean>> logout(
            @CookieValue(name = COOKIE, required = false) String token, HttpServletResponse res) {
        auth.logout(token);
        res.addHeader(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString());
        return ApiResponse.ok(Map.of("success", true));
    }

    @GetMapping("/me")
    @RequireAuth
    public ApiResponse<UserResponse> me(@RequestAttribute(AuthClaims.ATTRIBUTE) AuthClaims claims) {
        return ApiResponse.ok(users.get(claims.userId()));
    }

    private ApiResponse<Session> withCookie(HttpServletResponse res, IssuedSession issued) {
        res.addHeader(HttpHeaders.SET_COOKIE, cookie(issued.refreshToken(), props.refreshTokenTtl()).toString());
        return ApiResponse.ok(issued.session());
    }

    /** refresh_token: HttpOnly, SameSite=Lax, Path=/. A zero max-age deletes it. */
    private ResponseCookie cookie(String value, Duration maxAge) {
        return ResponseCookie.from(COOKIE, value)
                .httpOnly(true)
                .secure(props.cookieSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}
