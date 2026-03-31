package com.example.store_manager.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.dto.user.UserUpdateDto;
import com.example.store_manager.mapper.UserMapper;
import com.example.store_manager.model.Role;
import com.example.store_manager.model.User;
import com.example.store_manager.model.UserStatus;
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

    @Transactional(readOnly = true)
    public Result<List<UserResponseDto>> getAllUsers() {

        List<UserResponseDto> users = userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .toList();

        return Result.ok(users);
    }

    @Transactional
    public Result<Void> removeUser(UUID userId) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return Result.fail(ApiError.notFound("User not found"));
        }

        if (user.getStatus() == UserStatus.REMOVED) {
            return Result.ok();
        }

        user.setStatus(UserStatus.REMOVED);
        userRepository.save(user);

        return Result.ok();
    }

    @Transactional
    public Result<Void> updateUserRole(UUID userId, Role role) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return Result.fail(ApiError.notFound("User not found"));
        }

        user.setRole(role);
        userRepository.save(user);

        return Result.ok();
    }

    @Transactional(readOnly = true)
    public Result<Page<UserResponseDto>> searchUsers(
            String query,
            UserStatus status,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending());

        String normalizedQuery = normalizeQuery(query);
        boolean applyQuery = normalizedQuery != null;
        String queryPattern = applyQuery ? "%" + normalizedQuery + "%" : "%";

        Page<User> result = userRepository.searchUsers(
                applyQuery,
                queryPattern,
                status,
                pageable);

        return Result.ok(result.map(userMapper::toDto));
    }

    private String normalizeQuery(String query) {
        if (query == null) {
            return null;
        }

        String trimmedQuery = query.trim();
        if (trimmedQuery.isEmpty()) {
            return null;
        }

        return trimmedQuery.toLowerCase();
    }

}
