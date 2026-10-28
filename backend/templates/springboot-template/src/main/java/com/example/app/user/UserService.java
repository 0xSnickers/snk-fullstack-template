package com.example.app.user;

import com.example.app.common.AppException;
import com.example.app.common.PageResult;
import com.example.app.user.UserDtos.CreateUserRequest;
import com.example.app.user.UserDtos.UpdateUserRequest;
import com.example.app.user.UserDtos.UserResponse;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwords = new BCryptPasswordEncoder();

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public PageResult<UserResponse> list(int page, int limit) {
        var pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResult.of(repo.findAll(pageable).map(UserResponse::from));
    }

    @Transactional(readOnly = true)
    public UserResponse get(UUID id) {
        return UserResponse.from(find(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest req) {
        if (repo.existsByEmail(req.email())) {
            throw AppException.conflict("EMAIL_EXISTS", "Email already in use");
        }
        User user = new User(req.name(), req.email(), passwords.encode(req.password()), req.role());
        return UserResponse.from(repo.saveAndFlush(user));
    }

    @Transactional
    public UserResponse update(UUID id, UpdateUserRequest req) {
        User user = find(id);
        if (req.email() != null) {
            if (repo.existsByEmailAndIdNot(req.email(), id)) {
                throw AppException.conflict("EMAIL_EXISTS", "Email already in use");
            }
            user.setEmail(req.email());
        }
        if (req.name() != null) {
            user.setName(req.name());
        }
        if (req.role() != null) {
            user.setRole(req.role());
        }
        return UserResponse.from(repo.saveAndFlush(user));
    }

    @Transactional
    public Map<String, UUID> delete(UUID id) {
        repo.delete(find(id));
        return Map.of("id", id);
    }

    /** Returns the user when email and password match. */
    @Transactional(readOnly = true)
    public Optional<UserResponse> verifyCredentials(String email, String password) {
        return repo.findByEmail(email)
                .filter(u -> passwords.matches(password, u.getPasswordHash()))
                .map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public Optional<UserResponse> findById(UUID id) {
        return repo.findById(id).map(UserResponse::from);
    }

    private User find(UUID id) {
        return repo.findById(id).orElseThrow(() -> AppException.notFound("USER_NOT_FOUND", "User not found"));
    }
}
