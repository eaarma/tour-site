package com.tourhub.user.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.security.CurrentUserService;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.tourhub.user.dto.PublicManagerProfileDto;
import com.tourhub.user.dto.UserResponseDto;
import com.tourhub.user.dto.UserUpdateDto;
import com.tourhub.user.mapper.UserMapper;
import com.tourhub.user.model.Role;
import com.tourhub.user.model.User;
import com.tourhub.user.model.UserStatus;
import com.tourhub.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public Result<UserResponseDto> getUserProfile(UUID userId) {

        return userRepository.findById(userId)
                .map(userMapper::toDto)
                .map(Result::ok)
                .orElseGet(() -> Result.fail(ApiError.notFound("User not found")));
    }

    @Transactional(readOnly = true)
    public Result<UserResponseDto> getUserProfileForCurrentUserOrAdmin(UUID userId) {

        try {
            assertSelfOrAdmin(userId);
        } catch (AccessDeniedException ex) {
            return Result.fail(ApiError.forbidden(ex.getMessage()));
        }

        return getUserProfile(userId);
    }

    @Transactional(readOnly = true)
    public Result<PublicManagerProfileDto> getPublicManagerProfile(UUID userId) {

        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null
                || user.getRole() != Role.MANAGER
                || user.getStatus() != UserStatus.ACTIVE) {
            return Result.fail(ApiError.notFound("Manager not found"));
        }

        return Result.ok(userMapper.toPublicManagerProfileDto(user));
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

        // Apply only the fields provided in the request.
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
    public Result<Void> reinstateUser(UUID userId) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return Result.fail(ApiError.notFound("User not found"));
        }

        if (user.getStatus() != UserStatus.REMOVED) {
            return Result.ok();
        }

        user.setStatus(UserStatus.ACTIVE);
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

    private void assertSelfOrAdmin(UUID userId) {
        UUID currentUserId = currentUserService.getCurrentUserId();

        if (currentUserId == null) {
            throw new AccessDeniedException("Unauthorized");
        }

        if (currentUserService.hasRole("ADMIN")) {
            return;
        }

        if (!currentUserId.equals(userId)) {
            throw new AccessDeniedException("You are not allowed to access this user profile");
        }
    }

}
