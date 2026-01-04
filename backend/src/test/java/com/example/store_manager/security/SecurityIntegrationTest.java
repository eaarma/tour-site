package com.example.store_manager.security;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.store_manager.dto.shop.ShopDto;
import com.example.store_manager.security.testutil.TestUserFactory;
import com.example.store_manager.service.ShopService;
import com.example.store_manager.utility.Result;

import jakarta.servlet.http.Cookie;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        private CustomUserDetailsService userDetailsService;

        @MockitoBean
        private CurrentUserService currentUserService;

        @MockitoBean
        private ShopService shopService;

        @Test
        void postWithoutAuth_returns401() throws Exception {
                mockMvc.perform(post("/orders"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void invalidJwt_returns401() throws Exception {
                when(jwtService.validateAccessToken("bad-token"))
                                .thenReturn(false);

                mockMvc.perform(post("/orders")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer bad-token"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void userRoleBlockedFromManagerEndpoint_returns403() throws Exception {
                UUID userId = UUID.randomUUID();
                when(jwtService.validateAccessToken("good")).thenReturn(true);
                when(jwtService.getUserId("good")).thenReturn(userId);

                when(userDetailsService.loadUserById(userId))
                                .thenReturn(TestUserFactory.userWithRole("USER"));

                mockMvc.perform(post("/tours")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer good"))
                                .andExpect(status().isForbidden());
        }

        @Test
        void headerAuth_withManagerRole_allowsPostTour() throws Exception {
                UUID userId = UUID.randomUUID();

                // JWT is valid
                when(jwtService.validateAccessToken("good-token")).thenReturn(true);
                when(jwtService.getUserId("good-token")).thenReturn(userId);

                // User is MANAGER
                when(userDetailsService.loadUserById(userId))
                                .thenReturn(TestUserFactory.userWithRole("MANAGER"));

                mockMvc.perform(post("/tours")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer good-token")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                    {
                                                      "name": "Test Tour",
                                                      "description": "Test description",
                                                      "price": 10.0,
                                                      "location": "Test City",
                                                      "category": "WALKING"
                                                    }
                                                """))
                                .andExpect(status().is4xxClientError());
        }

}
