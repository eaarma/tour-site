package com.example.store_manager.service;

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
import com.example.store_manager.dto.user.ManagerRegisterRequestDto;
import com.example.store_manager.dto.user.UserRegisterRequestDto;
import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.model.Role;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.ShopUser;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.repository.ShopUserRepository;
import com.example.store_manager.utility.Result;
import com.example.store_manager.utility.ShopAssignmentUtil;

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

                Result<UserResponseDto> result = registrationService.registerUser(dto);

                assertTrue(result.isOk());
                assertEquals(savedUser.getId(), result.get().getId());
                assertEquals("test@example.com", result.get().getEmail());
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

                Result<UserResponseDto> result = registrationService.registerManager(dto);

                assertTrue(result.isOk());
                assertEquals(savedManager.getId(), result.get().getId());

                verifyNoInteractions(shopUserRepository);
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
