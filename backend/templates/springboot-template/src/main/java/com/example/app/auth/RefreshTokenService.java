package com.example.app.auth;

import com.example.app.config.AppProperties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Issues, resolves and revokes opaque refresh tokens (hashed at rest). */
@Service
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository repo;
    private final AppProperties props;

    public RefreshTokenService(RefreshTokenRepository repo, AppProperties props) {
        this.repo = repo;
        this.props = props;
    }

    @Transactional
    public String issue(UUID userId) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        repo.save(new RefreshToken(userId, sha256(token), Instant.now().plus(props.refreshTokenTtl())));
        return token;
    }

    @Transactional(readOnly = true)
    public Optional<UUID> resolve(String token) {
        return repo.findByTokenHashAndExpiresAtAfter(sha256(token), Instant.now()).map(RefreshToken::getUserId);
    }

    @Transactional
    public void revoke(String token) {
        repo.deleteByTokenHash(sha256(token));
    }

    private static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
