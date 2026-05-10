package com.tourhub.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.user.dto.UserResponseDto;
import com.tourhub.user.model.Role;
import com.tourhub.user.model.User;
import com.tourhub.user.repository.UserRepository;
import com.tourhub.common.email.EmailService;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.tourhub.shop.service.ShopAssignmentUtil;
import com.tourhub.auth.dto.ManagerRegisterRequestDto;
import com.tourhub.auth.dto.UserRegisterRequestDto;
import com.tourhub.shop.repository.ShopUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ShopAssignmentUtil shopAssignmentUtil;
    private final ShopUserRepository shopUserRepository;
    private final VerificationService verificationService;
    private final EmailService emailService;

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
                .role(Role.USER)
                .emailVerified(false)
                .build();

        User saved = userRepository.save(user);

        String token = verificationService.createVerificationToken(saved);
        emailService.sendVerificationEmail(saved, token);

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
                .role(Role.MANAGER)
                .emailVerified(false)
                .build();

        User saved = userRepository.save(manager);

        String token = verificationService.createVerificationToken(saved);
        emailService.sendVerificationEmail(saved, token);

        return Result.ok(UserResponseDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .build());
    }

}

