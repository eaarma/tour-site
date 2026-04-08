package com.example.store_manager.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.service.UserService;
import com.example.store_manager.utility.ResultResponseMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/public/users")
@RequiredArgsConstructor
public class PublicUserController {

    private final UserService userService;

    @GetMapping("/managers/{id}")
    public ResponseEntity<?> getPublicManagerProfile(@PathVariable("id") UUID id) {
        return ResultResponseMapper.toResponse(
                userService.getPublicManagerProfile(id));
    }
}
