package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.access.AccessDeniedException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.example.store_manager.dto.user.PublicManagerProfileDto;
import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.dto.user.UserUpdateDto;
import com.example.store_manager.mapper.UserMapper;
import com.example.store_manager.model.Role;
import com.example.store_manager.model.User;
import com.example.store_manager.model.UserStatus;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.CurrentUserService;
import com.example.store_manager.utility.Result;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    @Mock
    private CurrentUserService currentUserService;

    @Test
    void getUserProfile_returnsOk_whenUserExists() {
        UUID userId = UUID.randomUUID();

        User user = new User();
        UserResponseDto dto = new UserResponseDto();

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));
        when(userMapper.toDto(user))
                .thenReturn(dto);

        Result<UserResponseDto> result = userService.getUserProfile(userId);

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getUserProfile_returnsFail_whenUserNotFound() {
        UUID userId = UUID.randomUUID();

        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        Result<UserResponseDto> result = userService.getUserProfile(userId);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("User not found", result.error().message());
    }

    @Test
    void getUserProfileForCurrentUserOrAdmin_returnsOk_whenSelf() {
        UUID userId = UUID.randomUUID();

        User user = new User();
        UserResponseDto dto = new UserResponseDto();

        when(currentUserService.getCurrentUserId()).thenReturn(userId);
        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(dto);

        Result<UserResponseDto> result = userService.getUserProfileForCurrentUserOrAdmin(userId);

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getUserProfileForCurrentUserOrAdmin_returnsOk_whenAdmin() {
        UUID targetUserId = UUID.randomUUID();

        User user = new User();
        UserResponseDto dto = new UserResponseDto();

        when(currentUserService.getCurrentUserId()).thenReturn(UUID.randomUUID());
        when(currentUserService.hasRole("ADMIN")).thenReturn(true);
        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(dto);

        Result<UserResponseDto> result = userService.getUserProfileForCurrentUserOrAdmin(targetUserId);

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getUserProfileForCurrentUserOrAdmin_returnsForbidden_whenDifferentUser() {
        UUID targetUserId = UUID.randomUUID();

        when(currentUserService.getCurrentUserId()).thenReturn(UUID.randomUUID());
        when(currentUserService.hasRole("ADMIN")).thenReturn(false);

        Result<UserResponseDto> result = userService.getUserProfileForCurrentUserOrAdmin(targetUserId);

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
        verify(userRepository, never()).findById(any());
    }

    @Test
    void getPublicManagerProfile_returnsOk_whenActiveManager() {
        UUID userId = UUID.randomUUID();

        User user = new User();
        user.setRole(Role.MANAGER);
        user.setStatus(UserStatus.ACTIVE);

        PublicManagerProfileDto dto = new PublicManagerProfileDto();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userMapper.toPublicManagerProfileDto(user)).thenReturn(dto);

        Result<PublicManagerProfileDto> result = userService.getPublicManagerProfile(userId);

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getPublicManagerProfile_returnsNotFound_whenUserIsNotActiveManager() {
        UUID userId = UUID.randomUUID();

        User user = new User();
        user.setRole(Role.USER);
        user.setStatus(UserStatus.ACTIVE);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        Result<PublicManagerProfileDto> result = userService.getPublicManagerProfile(userId);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }

    @Test
    void updateProfile_returnsOk_whenValid() {
        UUID userId = UUID.randomUUID();

        User user = new User();
        UserUpdateDto updateDto = new UserUpdateDto();
        UserResponseDto responseDto = new UserResponseDto();

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));
        when(userMapper.toDto(user))
                .thenReturn(responseDto);

        Result<UserResponseDto> result = userService.updateProfile(userId, updateDto);

        assertTrue(result.isOk());
        assertSame(responseDto, result.get());
        verify(userMapper).updateUserFromDto(updateDto, user);
        verify(userRepository).save(user);
    }

    @Test
    void updateProfile_returnsFail_whenUserNotFound() {
        UUID userId = UUID.randomUUID();

        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        Result<UserResponseDto> result = userService.updateProfile(userId, new UserUpdateDto());

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("User not found", result.error().message());
    }

    @Test
    void searchUsers_ignoresBlankQueryAndUsesStatusOnly() {
        Page<User> page = new PageImpl<>(java.util.List.of());

        when(userRepository.searchUsers(eq(false), eq("%"), eq(UserStatus.ACTIVE), any()))
                .thenReturn(page);

        Result<Page<UserResponseDto>> result = userService.searchUsers("   ", UserStatus.ACTIVE, 0, 5);

        assertTrue(result.isOk());
        verify(userRepository).searchUsers(eq(false), eq("%"), eq(UserStatus.ACTIVE), any());
    }
}
