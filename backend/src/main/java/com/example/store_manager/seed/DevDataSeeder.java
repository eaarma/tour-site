package com.example.store_manager.seed;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

import com.example.store_manager.model.Role;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;

import jakarta.annotation.PostConstruct;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
    }

    private void seedUsers() {
        seedUser("admin@demo.com", Role.ADMIN, "admin");
        seedUser("manager@demo.com", Role.MANAGER, "manager");
        seedUser("user@demo.com", Role.USER, "user");
    }

    private void seedUser(String email, Role role, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            log.info("User {} already exists, skipping", email);
            return;
        }

        User user = new User();
        user.setEmail(email);
        user.setRole(role);
        user.setPassword(passwordEncoder.encode(rawPassword));

        userRepository.save(user);

        log.info("Seeded dev user {} with role {}", email, role);
    }
}

