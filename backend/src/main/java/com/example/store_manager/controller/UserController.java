package com.example.store_manager.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.dto.user.UserUpdateDto;
import com.example.store_manager.security.CurrentUserService;
import com.example.store_manager.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getProfile() {
        UUID userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> updateProfile(@RequestBody UserUpdateDto dto) {
        UUID userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(userService.updateProfile(userId, dto));
    }
}
