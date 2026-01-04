package com.example.store_manager.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.dto.user.UserUpdateDto;
import com.example.store_manager.security.CurrentUserService;
import com.example.store_manager.service.UserService;
import com.example.store_manager.utility.ResultResponseMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile() {
        UUID userId = currentUserService.getCurrentUserId();

        return ResultResponseMapper.toResponse(
                userService.getUserProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @RequestBody UserUpdateDto dto) {

        UUID userId = currentUserService.getCurrentUserId();

        return ResultResponseMapper.toResponse(
                userService.updateProfile(userId, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable("id") UUID id) {
        return ResultResponseMapper.toResponse(
                userService.getUserProfile(id));
    }
}
