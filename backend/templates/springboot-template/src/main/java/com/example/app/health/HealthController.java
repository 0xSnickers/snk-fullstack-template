package com.example.app.health;

import com.example.app.common.ApiResponse;
import com.example.app.common.AppException;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final JdbcTemplate jdbc;

    public HealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/health")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok(Map.of("status", "ok"));
    }

    @GetMapping("/ready")
    public ApiResponse<Map<String, String>> ready() {
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
        } catch (Exception e) {
            throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "NOT_READY", "Database is not reachable");
        }
        return ApiResponse.ok(Map.of("status", "ready"));
    }
}
