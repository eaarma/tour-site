package com.example.store_manager.security.testutil;

import org.springframework.security.core.userdetails.UserDetails;

import com.example.store_manager.security.CustomUserDetails;
import com.example.store_manager.model.Role;
import com.example.store_manager.model.User;
import java.util.UUID;

public class TestUserFactory {

    public static CustomUserDetails userWithRole(String role) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");
        user.setName("Test User");
        user.setRole(Role.valueOf(role)); // e.g. "USER", "MANAGER", "ADMIN"

        return new CustomUserDetails(user);
    }
}
