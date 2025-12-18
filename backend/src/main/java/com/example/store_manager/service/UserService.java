package com.example.store_manager.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.dto.user.UserUpdateDto;
import com.example.store_manager.mapper.UserMapper;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public Result<UserResponseDto> getUserProfile(UUID userId) {

        return userRepository.findById(userId)
                .map(userMapper::toDto)
                .map(Result::ok)
                .orElseGet(() -> Result.fail(ApiError.notFound("User not found")));
    }

    @Transactional
    public Result<UserResponseDto> updateProfile(
            UUID userId,
            UserUpdateDto dto) {

        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null) {
            return Result.fail(ApiError.notFound("User not found"));
        }

        // ✅ Apply only provided fields
        userMapper.updateUserFromDto(dto, user);
        userRepository.save(user);

        return Result.ok(userMapper.toDto(user));
    }
}
