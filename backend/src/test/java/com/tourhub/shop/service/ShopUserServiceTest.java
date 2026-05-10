package com.tourhub.shop.service;

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
import com.tourhub.shop.dto.ShopMembershipStatusDto;
import com.tourhub.shop.dto.PublicShopUserDto;
import com.tourhub.shop.dto.ShopUserDto;
import com.tourhub.shop.dto.ShopUserStatusDto;
import com.tourhub.shop.mapper.ShopUserMapper;
import com.tourhub.shop.model.Shop;
import com.tourhub.shop.model.ShopUser;
import com.tourhub.shop.model.ShopUserRole;
import com.tourhub.shop.model.ShopUserStatus;
import com.tourhub.user.model.User;
import com.tourhub.shop.repository.ShopRepository;
import com.tourhub.shop.repository.ShopUserRepository;
import com.tourhub.user.repository.UserRepository;
import com.tourhub.security.CurrentUserService;
import com.tourhub.common.result.Result;

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

    @Mock
    private CurrentUserService currentUserService;

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
    void getPublicActiveMembersForShop_returnsOkResult() {
        ShopUser shopUser = new ShopUser();
        PublicShopUserDto dto = new PublicShopUserDto();

        when(shopUserRepository.findByShopIdAndStatus(1L, ShopUserStatus.ACTIVE))
                .thenReturn(List.of(shopUser));
        when(shopUserMapper.toPublicDto(shopUser)).thenReturn(dto);

        Result<List<PublicShopUserDto>> result = service.getPublicActiveMembersForShop(1L);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));
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
        UUID actingUserId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Shop shop = new Shop();
        User user = new User();

        when(shopRepository.findById(1L)).thenReturn(Optional.of(shop));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(actingUserId);
        when(shopUserRepository.findByShopIdAndUserId(1L, actingUserId))
                .thenReturn(Optional.of(activeMembership(ShopUserRole.OWNER)));
        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.empty());

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
    void addUserToShop_returnsFail_whenProtectedRoleRequested() {
        UUID userId = UUID.randomUUID();

        when(shopRepository.findById(1L)).thenReturn(Optional.of(new Shop()));
        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));

        Result<Boolean> result = service.addUserToShop(1L, userId, "OWNER");

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    @Test
    void addUserToShop_returnsForbidden_whenActingUserIsNotOwnerOrAdmin() {
        UUID actingUserId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(shopRepository.findById(1L)).thenReturn(Optional.of(new Shop()));
        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(actingUserId);
        when(shopUserRepository.findByShopIdAndUserId(1L, actingUserId))
                .thenReturn(Optional.of(activeMembership(ShopUserRole.MANAGER)));
        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.empty());

        Result<Boolean> result = service.addUserToShop(1L, userId, "guide");

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
        verify(shopUserRepository, never()).save(any(ShopUser.class));
    }

    @Test
    void updateUserStatus_returnsOk_whenManagerApprovesPendingMember() {
        UUID actingUserId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = new ShopUser();
        shopUser.setStatus(ShopUserStatus.PENDING);
        shopUser.setRole(ShopUserRole.GUIDE);

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));
        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(actingUserId);
        when(shopUserRepository.findByShopIdAndUserId(1L, actingUserId))
                .thenReturn(Optional.of(activeMembership(ShopUserRole.MANAGER)));

        Result<Boolean> result = service.updateUserStatus(1L, userId, "active");

        assertTrue(result.isOk());
        assertEquals(ShopUserStatus.ACTIVE, shopUser.getStatus());
    }

    @Test
    void updateUserStatus_returnsOk_whenManagerRejectsPendingMember() {
        UUID actingUserId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = new ShopUser();
        shopUser.setStatus(ShopUserStatus.PENDING);
        shopUser.setRole(ShopUserRole.GUIDE);

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));
        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(actingUserId);
        when(shopUserRepository.findByShopIdAndUserId(1L, actingUserId))
                .thenReturn(Optional.of(activeMembership(ShopUserRole.MANAGER)));

        Result<Boolean> result = service.updateUserStatus(1L, userId, "rejected");

        assertTrue(result.isOk());
        assertEquals(ShopUserStatus.REJECTED, shopUser.getStatus());
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
    void updateUserStatus_returnsForbidden_whenManagerDisablesActiveMember() {
        UUID actingUserId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = activeMembership(ShopUserRole.GUIDE);

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));
        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(actingUserId);
        when(shopUserRepository.findByShopIdAndUserId(1L, actingUserId))
                .thenReturn(Optional.of(activeMembership(ShopUserRole.MANAGER)));

        Result<Boolean> result = service.updateUserStatus(1L, userId, "disabled");

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void updateUserStatus_returnsOk_whenOwnerDisablesActiveMember() {
        UUID actingUserId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = activeMembership(ShopUserRole.GUIDE);

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));
        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(actingUserId);
        when(shopUserRepository.findByShopIdAndUserId(1L, actingUserId))
                .thenReturn(Optional.of(activeMembership(ShopUserRole.OWNER)));

        Result<Boolean> result = service.updateUserStatus(1L, userId, "disabled");

        assertTrue(result.isOk());
        assertEquals(ShopUserStatus.DISABLED, shopUser.getStatus());
    }

    @Test
    void updateUserStatus_returnsForbidden_whenTargetIsOwner() {
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = activeMembership(ShopUserRole.OWNER);

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));

        Result<Boolean> result = service.updateUserStatus(1L, userId, "disabled");

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void updateUserStatus_returnsFail_whenTransitionIsInvalid() {
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = activeMembership(ShopUserRole.GUIDE);

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));

        Result<Boolean> result = service.updateUserStatus(1L, userId, "rejected");

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    @Test
    void updateUserRole_returnsOk_whenOwnerChangesGuideToManager() {
        UUID actingUserId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = activeMembership(ShopUserRole.GUIDE);

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));
        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(actingUserId);
        when(shopUserRepository.findByShopIdAndUserId(1L, actingUserId))
                .thenReturn(Optional.of(activeMembership(ShopUserRole.OWNER)));

        Result<Boolean> result = service.updateUserRole(1L, userId, "manager");

        assertTrue(result.isOk());
        assertEquals(ShopUserRole.MANAGER, shopUser.getRole());
    }

    @Test
    void updateUserRole_returnsForbidden_whenActingUserIsManager() {
        UUID actingUserId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = activeMembership(ShopUserRole.GUIDE);

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));
        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(actingUserId);
        when(shopUserRepository.findByShopIdAndUserId(1L, actingUserId))
                .thenReturn(Optional.of(activeMembership(ShopUserRole.MANAGER)));

        Result<Boolean> result = service.updateUserRole(1L, userId, "manager");

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void updateUserRole_returnsFail_whenProtectedRoleRequested() {
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = activeMembership(ShopUserRole.GUIDE);

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));

        Result<Boolean> result = service.updateUserRole(1L, userId, "owner");

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    @Test
    void updateUserRole_returnsForbidden_whenTargetIsOwner() {
        UUID actingUserId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ShopUser shopUser = activeMembership(ShopUserRole.OWNER);

        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(shopUser));
        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(actingUserId);
        when(shopUserRepository.findByShopIdAndUserId(1L, actingUserId))
                .thenReturn(Optional.of(activeMembership(ShopUserRole.OWNER)));

        Result<Boolean> result = service.updateUserRole(1L, userId, "manager");

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
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

        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.hasRole("MANAGER")).thenReturn(true);
        when(shopRepository.findById(1L)).thenReturn(Optional.of(new Shop()));
        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.of(new ShopUser()));

        Result<Boolean> result = service.requestJoinShop(1L, userId);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    @Test
    void requestJoinShop_returnsOk_whenManagerRequests() {
        UUID userId = UUID.randomUUID();

        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.hasRole("MANAGER")).thenReturn(true);
        when(shopRepository.findById(1L)).thenReturn(Optional.of(new Shop()));
        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        when(shopUserRepository.findByShopIdAndUserId(1L, userId))
                .thenReturn(Optional.empty());

        Result<Boolean> result = service.requestJoinShop(1L, userId);

        assertTrue(result.isOk());
        assertTrue(result.get());
        verify(shopUserRepository).save(any(ShopUser.class));
    }

    @Test
    void requestJoinShop_returnsForbidden_whenUserLacksManagerOrAdminRole() {
        UUID userId = UUID.randomUUID();

        when(currentUserService.hasRole("ADMIN")).thenReturn(false);
        when(currentUserService.hasRole("MANAGER")).thenReturn(false);

        Result<Boolean> result = service.requestJoinShop(1L, userId);

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
        verify(shopRepository, never()).findById(anyLong());
        verify(shopUserRepository, never()).save(any());
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

    private ShopUser activeMembership(ShopUserRole role) {
        ShopUser membership = new ShopUser();
        membership.setRole(role);
        membership.setStatus(ShopUserStatus.ACTIVE);
        return membership;
    }
}

