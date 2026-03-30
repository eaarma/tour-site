package com.example.store_manager.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.dto.user.UserUpdateDto;
import com.example.store_manager.model.Role;
import com.example.store_manager.model.UserStatus;
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

    @PatchMapping("/{id}/remove")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeUser(@PathVariable("id") UUID id) {
        return ResultResponseMapper.toResponse(
                userService.removeUser(id));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(
            @PathVariable("id") UUID id,
            @RequestParam("role") Role role) {

        return ResultResponseMapper.toResponse(
                userService.updateUserRole(id, role));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsers(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "status", required = false) UserStatus status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        return ResultResponseMapper.toResponse(
                userService.searchUsers(query, status, page, size));
    }

}
