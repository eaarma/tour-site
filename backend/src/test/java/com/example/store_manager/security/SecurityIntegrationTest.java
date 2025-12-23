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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
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
        void postWithoutCsrf_returns403() throws Exception {
                mockMvc.perform(post("/orders"))
                                .andExpect(status().isForbidden());
        }

        @Test
        void postWithCsrf_butNoAuth_returns401() throws Exception {
                mockMvc.perform(post("/orders")
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void invalidJwt_returns401() throws Exception {
                when(jwtService.validateAccessToken("bad-token"))
                                .thenReturn(false);

                mockMvc.perform(post("/orders")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer bad-token")
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void userRoleBlockedFromManagerEndpoint_returns403() throws Exception {
                UUID userId = UUID.randomUUID();

                when(jwtService.validateAccessToken("good"))
                                .thenReturn(true);
                when(jwtService.getUserId("good"))
                                .thenReturn(userId);

                when(userDetailsService.loadUserById(userId))
                                .thenReturn(TestUserFactory.userWithRole("ROLE_USER"));

                mockMvc.perform(post("/tours")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer good")
                                .with(csrf()))
                                .andExpect(status().isForbidden());
        }

        @Test
        void cookieAuth_withCsrf_allowsAuthenticatedPostRequest() throws Exception {
                UUID userId = UUID.randomUUID();

                // JWT is valid
                when(jwtService.validateAccessToken("good-token"))
                                .thenReturn(true);
                when(jwtService.getUserId("good-token"))
                                .thenReturn(userId);

                // User exists
                when(userDetailsService.loadUserById(userId))
                                .thenReturn(TestUserFactory.userWithRole("USER"));

                // Current user service resolves ID
                when(currentUserService.getCurrentUserId())
                                .thenReturn(userId);

                // Service succeeds
                when(shopService.createShop(any(), eq(userId)))
                                .thenReturn(Result.ok(new ShopDto()));

                mockMvc.perform(post("/shops")
                                .cookie(new Cookie("accessToken", "good-token"))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                    {
                                                      "name": "Test Shop",
                                                      "description": "Test description"
                                                    }
                                                """))
                                .andExpect(status().isOk());
        }

}
