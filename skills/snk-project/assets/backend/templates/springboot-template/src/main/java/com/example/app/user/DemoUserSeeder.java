package com.example.app.user;

import com.example.app.config.AppProperties;
import com.example.app.user.UserDtos.CreateUserRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** Creates the demo admin account on startup when SEED_DEMO_USER=true. */
@Component
public class DemoUserSeeder implements ApplicationRunner {

    public static final CreateUserRequest DEMO_USER =
            new CreateUserRequest("Demo User", "demo@example.com", "password123", User.ROLE_ADMIN);
    private static final Logger log = LoggerFactory.getLogger(DemoUserSeeder.class);

    private final AppProperties props;
    private final UserRepository repo;
    private final UserService users;

    public DemoUserSeeder(AppProperties props, UserRepository repo, UserService users) {
        this.props = props;
        this.repo = repo;
        this.users = users;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (props.seedDemoUser() && !repo.existsByEmail(DEMO_USER.email())) {
            users.create(DEMO_USER);
            log.info("demo user created: {}", DEMO_USER.email());
        }
    }
}
