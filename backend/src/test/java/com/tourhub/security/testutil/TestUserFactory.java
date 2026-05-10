package com.tourhub.security.testutil;

import org.springframework.security.core.userdetails.UserDetails;

import com.tourhub.security.CustomUserDetails;
import com.tourhub.user.model.Role;
import com.tourhub.user.model.User;
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


