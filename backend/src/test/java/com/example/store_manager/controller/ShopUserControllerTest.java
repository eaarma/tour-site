package com.example.store_manager.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.store_manager.dto.shop.ShopMembershipStatusDto;
import com.example.store_manager.dto.shop.ShopUserDto;
import com.example.store_manager.model.ShopUserRole;
import com.example.store_manager.model.ShopUserStatus;
import com.example.store_manager.security.CurrentUserService;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtAuthenticationFilter;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.ShopUserService;
import com.example.store_manager.utility.Result;

@WebMvcTest(controllers = ShopUserController.class)
@AutoConfigureMockMvc(addFilters = false)
class ShopUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ShopUserService shopUserService;

    @MockitoBean
    private CurrentUserService currentUserService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    // ----------------------------
    // Tests
    // ----------------------------

    @Test
    void getUsersForShop_returnsOk() throws Exception {
        when(shopUserService.getUsersByShopId(1L))
                .thenReturn(Result.ok(List.of()));

        mockMvc.perform(get("/api/shop-users/shop/{shopId}", 1L))
                .andExpect(status().isOk());
    }

    @Test
    void getActiveMembers_returnsOk() throws Exception {
        when(shopUserService.getActiveMembersForShop(1L))
                .thenReturn(Result.ok(List.of()));

        mockMvc.perform(get("/api/shop-users/shop/{shopId}/active", 1L))
                .andExpect(status().isOk());
    }

    @Test
    void getShopsForCurrentUser_returnsOk() throws Exception {
        UUID userId = UUID.randomUUID();

        when(currentUserService.getCurrentUserId())
                .thenReturn(userId);

        when(shopUserService.getShopsForUser(userId))
                .thenReturn(Result.ok(List.of()));

        mockMvc.perform(get("/api/shop-users/user/me"))
                .andExpect(status().isOk());
    }

    @Test
    void addUserToShop_returnsOk() throws Exception {
        UUID userId = UUID.randomUUID();

        when(shopUserService.addUserToShop(1L, userId, "MANAGER"))
                .thenReturn(Result.ok(true));

        mockMvc.perform(post("/api/shop-users/{shopId}/{userId}", 1L, userId)
                .param("role", "MANAGER"))
                .andExpect(status().isOk());
    }

    @Test
    void updateStatus_returnsOk() throws Exception {
        UUID userId = UUID.randomUUID();

        when(shopUserService.updateUserStatus(1L, userId, "ACTIVE"))
                .thenReturn(Result.ok(true));

        mockMvc.perform(patch("/api/shop-users/{shopId}/{userId}/status", 1L, userId)
                .param("status", "ACTIVE"))
                .andExpect(status().isOk());
    }

    @Test
    void updateRole_returnsOk() throws Exception {
        UUID userId = UUID.randomUUID();

        when(shopUserService.updateUserRole(1L, userId, "ADMIN"))
                .thenReturn(Result.ok(true));

        mockMvc.perform(patch("/api/shop-users/{shopId}/{userId}/role", 1L, userId)
                .param("role", "ADMIN"))
                .andExpect(status().isOk());
    }

    @Test
    void requestJoinShop_returnsOk() throws Exception {
        UUID userId = UUID.randomUUID();

        when(currentUserService.getCurrentUserId())
                .thenReturn(userId);

        when(shopUserService.requestJoinShop(1L, userId))
                .thenReturn(Result.ok(true));

        mockMvc.perform(post("/api/shop-users/shop/{shopId}/request", 1L))
                .andExpect(status().isOk());
    }

    @Test
    void checkMembership_returnsOk() throws Exception {
        UUID userId = UUID.randomUUID();

        when(currentUserService.getCurrentUserId())
                .thenReturn(userId);

        ShopMembershipStatusDto dto = ShopMembershipStatusDto.builder()
                .status(ShopUserStatus.ACTIVE)
                .role(ShopUserRole.CUSTOMER)
                .build();

        when(shopUserService.getMembership(1L, userId))
                .thenReturn(Result.ok(dto));

        mockMvc.perform(get("/api/shop-users/membership/{shopId}", 1L))
                .andExpect(status().isOk());
    }

}
