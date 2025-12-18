package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.dto.user.UserUpdateDto;
import com.example.store_manager.mapper.UserMapper;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.utility.Result;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

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
}
