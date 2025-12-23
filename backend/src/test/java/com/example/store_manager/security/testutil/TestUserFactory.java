package com.example.store_manager.security.testutil;

import org.springframework.security.core.userdetails.UserDetails;

public class TestUserFactory {

    public static UserDetails userWithRole(String role) {
        return org.springframework.security.core.userdetails.User
                .withUsername("test")
                .password("pw")
                .authorities(role)
                .build();
    }
}
