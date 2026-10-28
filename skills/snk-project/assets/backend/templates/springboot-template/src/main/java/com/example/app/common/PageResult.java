package com.example.app.common;

import java.util.List;
import org.springframework.data.domain.Page;

public record PageResult<T>(List<T> items, Pagination pagination) {

    public record Pagination(int page, int limit, long total, int totalPages) {}

    public static <T> PageResult<T> of(Page<T> page) {
        return new PageResult<>(
                page.getContent(),
                new Pagination(page.getNumber() + 1, page.getSize(), page.getTotalElements(), page.getTotalPages()));
    }
}
