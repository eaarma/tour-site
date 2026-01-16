package com.example.store_manager.seed;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.UUID;

import com.example.store_manager.model.Role;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        seedUsers();
    }

    private void seedUsers() {
        if (userRepository.existsByEmail("admin@demo.com")) {
            log.info("Dev data already seeded, skipping");
            return;
        }

        User admin = new User();
        admin.setId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        admin.setEmail("admin@demo.com");
        admin.setRole(Role.ADMIN);
        admin.setPassword("not-a-real-password");

        userRepository.save(admin);

        log.info("Dev demo users seeded");
    }
}
