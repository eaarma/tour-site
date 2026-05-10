package com.tourhub.auth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.tourhub.auth.dto.ManagerRegisterRequestDto;
import com.tourhub.auth.dto.UserRegisterRequestDto;
import com.tourhub.user.dto.UserResponseDto;
import com.tourhub.user.model.Role;
import com.tourhub.shop.model.Shop;
import com.tourhub.shop.model.ShopUser;
import com.tourhub.user.model.User;
import com.tourhub.common.email.EmailService;
import com.tourhub.user.repository.UserRepository;
import com.tourhub.shop.repository.ShopUserRepository;
import com.tourhub.common.result.Result;
import com.tourhub.shop.service.ShopAssignmentUtil;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

        @Mock
        private UserRepository userRepository;

        @Mock
        private PasswordEncoder passwordEncoder;

        @Mock
        private ShopAssignmentUtil shopAssignmentUtil;

        @Mock
        private ShopUserRepository shopUserRepository;

        @InjectMocks
        private RegistrationService registrationService;

        @Mock
        private VerificationService verificationService;

        @Mock
        private EmailService emailService;

        @Test
        void registerUser_returnsOk_whenEmailNotUsed() {
                UserRegisterRequestDto dto = new UserRegisterRequestDto();
                dto.setEmail("test@example.com");
                dto.setPassword("pw");
                dto.setName("Test");

                when(userRepository.existsByEmail("test@example.com"))
                                .thenReturn(false);
                when(passwordEncoder.encode("pw"))
                                .thenReturn("hashed");

                User savedUser = new User();
                savedUser.setId(UUID.randomUUID());
                savedUser.setEmail("test@example.com");
                savedUser.setName("Test");
                savedUser.setRole(Role.USER);

                when(userRepository.save(any(User.class)))
                                .thenReturn(savedUser);

                when(verificationService.createVerificationToken(any(User.class)))
                                .thenReturn("token-123");

                Result<UserResponseDto> result = registrationService.registerUser(dto);

                assertTrue(result.isOk());
                assertEquals(savedUser.getId(), result.get().getId());
                assertEquals("test@example.com", result.get().getEmail());
                verify(emailService).sendVerificationEmail(any(User.class), eq("token-123"));
        }

        @Test
        void registerUser_returnsFail_whenEmailExists() {
                UserRegisterRequestDto dto = new UserRegisterRequestDto();
                dto.setEmail("test@example.com");

                when(userRepository.existsByEmail("test@example.com"))
                                .thenReturn(true);

                Result<UserResponseDto> result = registrationService.registerUser(dto);

                assertTrue(result.isFail());
                assertEquals("BAD_REQUEST", result.error().code());
                assertEquals("Email already in use", result.error().message());
        }

        @Test
        void registerManager_returnsOk_whenEmailNotUsed() {

                ManagerRegisterRequestDto dto = new ManagerRegisterRequestDto();
                dto.setEmail("manager@example.com");
                dto.setPassword("pw");
                dto.setName("Manager");

                when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
                when(passwordEncoder.encode("pw")).thenReturn("hashed");

                User savedManager = new User();
                savedManager.setId(UUID.randomUUID());
                savedManager.setEmail(dto.getEmail());
                savedManager.setRole(Role.MANAGER);

                when(userRepository.save(any(User.class))).thenReturn(savedManager);

                when(verificationService.createVerificationToken(any(User.class)))
                                .thenReturn("token-123");

                Result<UserResponseDto> result = registrationService.registerManager(dto);

                assertTrue(result.isOk());
                assertEquals(savedManager.getId(), result.get().getId());

                verifyNoInteractions(shopUserRepository);
                verify(emailService).sendVerificationEmail(any(User.class), eq("token-123"));

        }

        @Test
        void registerManager_returnsFail_whenEmailExists() {
                ManagerRegisterRequestDto dto = new ManagerRegisterRequestDto();
                dto.setEmail("manager@example.com");

                when(userRepository.existsByEmail("manager@example.com"))
                                .thenReturn(true);

                Result<UserResponseDto> result = registrationService.registerManager(dto);

                assertTrue(result.isFail());
                assertEquals("BAD_REQUEST", result.error().code());
                assertEquals("Email already in use", result.error().message());
        }
}

