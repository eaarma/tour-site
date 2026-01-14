package com.example.store_manager.service;

import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.store_manager.dto.user.UserRegisterRequestDto;
import com.example.store_manager.dto.user.ManagerRegisterRequestDto;
import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.model.Role;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.ShopUser;
import com.example.store_manager.model.ShopUserRole;
import com.example.store_manager.model.ShopUserStatus;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.repository.ShopUserRepository;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.example.store_manager.utility.ShopAssignmentUtil;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ShopAssignmentUtil shopAssignmentUtil;
    private final ShopUserRepository shopUserRepository;

    @Transactional
    public Result<UserResponseDto> registerUser(UserRegisterRequestDto request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return Result.fail(ApiError.badRequest("Email already in use"));
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .nationality(request.getNationality())
                .createdAt(LocalDateTime.now())
                .role(Role.USER)
                .build();

        User saved = userRepository.save(user);

        return Result.ok(UserResponseDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .build());
    }

    @Transactional
    public Result<UserResponseDto> registerManager(ManagerRegisterRequestDto request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return Result.fail(ApiError.badRequest("Email already in use"));
        }

        User manager = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName().trim())
                .phone(request.getPhone())
                .bio(request.getBio())
                .experience(request.getExperience())
                .languages(request.getLanguages())
                .createdAt(LocalDateTime.now())
                .role(Role.MANAGER)
                .build();

        User saved = userRepository.save(manager);

        return Result.ok(UserResponseDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .build());
    }
}
