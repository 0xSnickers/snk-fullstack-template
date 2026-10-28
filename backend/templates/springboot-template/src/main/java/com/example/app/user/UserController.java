package com.example.app.user;

import com.example.app.common.ApiResponse;
import com.example.app.common.PageResult;
import com.example.app.security.RequireAuth;
import com.example.app.user.UserDtos.CreateUserRequest;
import com.example.app.user.UserDtos.UpdateUserRequest;
import com.example.app.user.UserDtos.UserResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Reads need a login; writes need the admin role. */
@RestController
@RequestMapping("/api/v1/users")
@RequireAuth
public class UserController {

    private final UserService users;

    public UserController(UserService users) {
        this.users = users;
    }

    @GetMapping
    public ApiResponse<PageResult<UserResponse>> list(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int limit) {
        return ApiResponse.ok(users.list(page, limit));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(users.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @RequireAuth(roles = User.ROLE_ADMIN)
    public ApiResponse<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        return ApiResponse.ok(users.create(req));
    }

    @PutMapping("/{id}")
    @RequireAuth(roles = User.ROLE_ADMIN)
    public ApiResponse<UserResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest req) {
        return ApiResponse.ok(users.update(id, req));
    }

    @DeleteMapping("/{id}")
    @RequireAuth(roles = User.ROLE_ADMIN)
    public ApiResponse<Map<String, UUID>> delete(@PathVariable UUID id) {
        return ApiResponse.ok(users.delete(id));
    }
}
