package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.example.store_manager.dto.shop.ShopMembershipStatusDto;
import com.example.store_manager.dto.shop.ShopUserDto;
import com.example.store_manager.dto.shop.ShopUserStatusDto;
import com.example.store_manager.mapper.ShopUserMapper;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.ShopUser;
import com.example.store_manager.model.ShopUserRole;
import com.example.store_manager.model.ShopUserStatus;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.ShopRepository;
import com.example.store_manager.repository.ShopUserRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.utility.Result;

@ExtendWith(MockitoExtension.class)
class ShopUserServiceTest {

    @Mock
    private ShopUserRepository shopUserRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ShopRepository shopRepository;

    @Mock
    private ShopUserMapper shopUserMapper;

    @InjectMocks
    private ShopUserService service;

    @Test
    void getUsersByShopId_returnsOkResult() {
        ShopUser shopUser = new ShopUser();
        ShopUserDto dto = new ShopUserDto();

        when(shopUserRepository.findByShopId(1L)).thenReturn(List.of(shopUser));
        when(shopUserMapper.toDto(shopUser)).thenReturn(dto);

        Result<List<ShopUserDto>> result = service.getUsersByShopId(1L);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));
    }

    @Test
    void getActiveMembersForShop_returnsOkResult() {
        ShopUser shopUser = new ShopUser();
        ShopUserDto dto = new ShopUserDto();

        when(shopUserRepository.findByShopIdAndStatus(1L, ShopUserStatus.ACTIVE))
                .thenReturn(List.of(shopUser));
        when(shopUserMapper.toDto(shopUser)).thenReturn(dto);

        Result<List<ShopUserDto>> result = service.getActiveMembersForShop(1L);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
    }

    @Test
    void getShopsForUser_returnsOkResult() {
        ShopUser shopUser = new ShopUser();
        ShopUserStatusDto dto = new ShopUserStatusDto();

        when(shopUserRepository.findByUserId(any())).thenReturn(List.of(shopUser));
        when(shopUserMapper.toStatusDto(shopUser)).thenReturn(dto);

        Result<List<ShopUserStatusDto>> result = service.getShopsForUser(UUID.randomUUID());

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
    }

    @Test
    void addUserToShop_returnsOk_whenValid() {
        UUID userId = UUID.randomUUID();
        Shop shop = new Shop();
        User user = new User();

        when(shopRepository.findById(1L)).thenReturn(Optional.of(shop));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        Result<Boolean> result = service.addUserToShop(1L, userId, "guide");

        assertTrue(result.isOk());
        assertTrue(result.get());

        verify(shopUserRepository).save(any(ShopUser.class));
    }

    @Test
    void addUserToShop_returnsFail_whenShopNotFound() {
        when(shopRepository.findById(1L)).thenReturn(Optional.empty());

        Result<Boolean> result = service.addUserToShop(1L, UUID.randomUUID(), "guide");

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }

    @Test
    void addUserToShop_returnsFail_whenInvalidRole() {
        UUID userId = UUID.randomUUID();
        when(shopRepository.findById(1L)).thenReturn(Optional.of(new Shop()));
        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));

        Result<Boolean> result = service.addUserToShop(1L, userId, "invalid");

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    @Test
    void updateUserStatus_returnsOk_whenValid() {
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = new ShopUser();

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));

        Result<Boolean> result = service.updateUserStatus(1L, userId, "active");

        assertTrue(result.isOk());
        assertEquals(ShopUserStatus.ACTIVE, shopUser.getStatus());
    }

    @Test
    void updateUserStatus_returnsFail_whenNotFound() {
        UUID userId = UUID.randomUUID();

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.empty());

        Result<Boolean> result = service.updateUserStatus(1L, userId, "active");

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }

    @Test
    void updateUserRole_returnsOk_whenValid() {
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = new ShopUser();

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));

        Result<Boolean> result = service.updateUserRole(1L, userId, "manager");

        assertTrue(result.isOk());
        assertEquals(ShopUserRole.MANAGER, shopUser.getRole());
    }

    @Test
    void hasShopRole_returnsFalse_whenNotFound() {
        UUID userId = UUID.randomUUID();

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.empty());

        boolean result = service.hasShopRole(1L, userId, ShopUserRole.MANAGER);

        assertFalse(result);
    }

    @Test
    void requestJoinShop_returnsFail_whenDuplicate() {
        UUID userId = UUID.randomUUID();

        when(shopRepository.findById(1L)).thenReturn(Optional.of(new Shop()));
        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(new ShopUser()));

        Result<Boolean> result = service.requestJoinShop(1L, userId);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    @Test
    void getMembership_returnsOk_whenMemberExists() {
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = new ShopUser();
        shopUser.setRole(ShopUserRole.GUIDE);
        shopUser.setStatus(ShopUserStatus.ACTIVE);

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));

        Result<ShopMembershipStatusDto> result = service.getMembership(1L, userId);

        assertTrue(result.isOk());
        assertTrue(result.get().isMember());
        assertEquals(ShopUserRole.GUIDE, result.get().getRole());
        assertEquals(ShopUserStatus.ACTIVE, result.get().getStatus());
    }

    @Test
    void getMembership_returnsFail_whenNotMember() {
        UUID userId = UUID.randomUUID();

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.empty());

        Result<ShopMembershipStatusDto> result = service.getMembership(1L, userId);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }
}
