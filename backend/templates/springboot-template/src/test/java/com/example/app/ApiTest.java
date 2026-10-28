package com.example.app;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.app.user.DemoUserSeeder;
import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiTest {

    @Autowired MockMvc mvc;

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder req, String body) {
        return req.contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    private MvcResult login(String email, String password) throws Exception {
        return mvc.perform(json(post("/api/v1/auth/login"), "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
    }

    private static String token(MvcResult result) throws Exception {
        return JsonPath.read(result.getResponse().getContentAsString(), "$.data.accessToken");
    }

    private String register(String name, String email) throws Exception {
        mvc.perform(json(post("/api/v1/auth/register"),
                "{\"name\":\"" + name + "\",\"email\":\"" + email + "\",\"password\":\"password123\"}"));
        return token(login(email, "password123"));
    }

    @Test
    void ops() throws Exception {
        mvc.perform(get("/api/health").header("X-Request-ID", "abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.status").value("ok"))
                .andExpect(header().string("X-Request-ID", "abc"));
        mvc.perform(get("/api/ready")).andExpect(jsonPath("$.data.status").value("ready"));
        mvc.perform(get("/api/v1/nope"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"))
                .andExpect(jsonPath("$.data").isEmpty());
        mvc.perform(get("/api/v1/nope").header("Accept-Language", "zh-CN"))
                .andExpect(jsonPath("$.message").value("接口不存在"));
        mvc.perform(get("/api/v1/nope").header("Accept-Language", "en-US"))
                .andExpect(jsonPath("$.message").value("Resource not found"));
        mvc.perform(json(post("/api/v1/auth/login"), "{bad"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void authFlow() throws Exception {
        MvcResult reg = mvc.perform(json(post("/api/v1/auth/register"),
                        "{\"name\":\" Alice \",\"email\":\" ALICE@example.com \",\"password\":\"password123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.user.email").value("alice@example.com"))
                .andExpect(jsonPath("$.data.user.name").value("Alice"))
                .andExpect(jsonPath("$.data.user.role").value("user"))
                .andExpect(jsonPath("$.data.user.passwordHash").doesNotExist())
                .andReturn();
        assertThat(reg.getResponse().getHeader("Set-Cookie")).contains("refresh_token=").contains("HttpOnly");

        mvc.perform(json(post("/api/v1/auth/register"),
                        "{\"name\":\"Alice\",\"email\":\"alice@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_EXISTS"));
        mvc.perform(json(post("/api/v1/auth/login"), "{\"email\":\"alice@example.com\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));

        MvcResult res = login("alice@example.com", "password123");
        Cookie cookie = res.getResponse().getCookie("refresh_token");
        mvc.perform(get("/api/v1/auth/me").header("Authorization", bearer(token(res))))
                .andExpect(jsonPath("$.data.email").value("alice@example.com"));
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer nope"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mvc.perform(post("/api/v1/auth/refresh").cookie(cookie)).andExpect(status().isOk());
        mvc.perform(post("/api/v1/auth/logout").cookie(cookie)).andExpect(jsonPath("$.data.success").value(true));
        mvc.perform(post("/api/v1/auth/session").cookie(cookie))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void users() throws Exception {
        mvc.perform(get("/api/v1/users")).andExpect(status().isUnauthorized());
        String member = register("Bob", "bob@example.com");
        String admin = token(login(DemoUserSeeder.DEMO_USER.email(), DemoUserSeeder.DEMO_USER.password()));

        mvc.perform(get("/api/v1/users").header("Authorization", bearer(member)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pagination.page").value(1))
                .andExpect(jsonPath("$.data.pagination.limit").value(10));
        mvc.perform(get("/api/v1/users?limit=1000").header("Authorization", bearer(member)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        mvc.perform(get("/api/v1/users/not-a-uuid").header("Authorization", bearer(member)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

        String carol = "{\"name\":\"Carol\",\"email\":\"carol@example.com\",\"password\":\"password123\"}";
        mvc.perform(json(post("/api/v1/users"), carol).header("Authorization", bearer(member)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        String body = mvc.perform(json(post("/api/v1/users"), carol).header("Authorization", bearer(admin)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String url = "/api/v1/users/" + JsonPath.read(body, "$.data.id");

        mvc.perform(json(put(url), "{\"role\":\"admin\"}").header("Authorization", bearer(admin)))
                .andExpect(jsonPath("$.data.role").value("admin"));
        mvc.perform(json(put(url), "{\"role\":\"root\"}").header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest());
        mvc.perform(json(put(url), "{\"email\":\"bob@example.com\"}").header("Authorization", bearer(admin)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_EXISTS"));
        mvc.perform(delete(url).header("Authorization", bearer(admin))).andExpect(status().isOk());
        mvc.perform(get(url).header("Authorization", bearer(admin)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("USER_NOT_FOUND"));
    }
}
