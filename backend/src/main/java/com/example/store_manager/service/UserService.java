package com.example.store_manager.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.dto.user.UserUpdateDto;
import com.example.store_manager.mapper.UserMapper;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserResponseDto getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toDto(user);
    }

    public UserResponseDto updateProfile(UUID userId, UserUpdateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Apply only provided fields
        userMapper.updateUserFromDto(dto, user);
        userRepository.save(user);

        return userMapper.toDto(user);
    }
}
