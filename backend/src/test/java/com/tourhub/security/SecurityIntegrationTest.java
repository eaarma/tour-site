package com.tourhub.security;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.tourhub.user.dto.PublicManagerProfileDto;
import com.tourhub.security.testutil.TestUserFactory;
import com.tourhub.common.email.EmailService;
import com.tourhub.shop.service.ShopService;
import com.tourhub.user.service.UserService;
import com.tourhub.common.result.Result;

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

        @MockitoBean
        private EmailService emailService;

        @MockitoBean
        private UserService userService;

        @Test
        void postWithoutAuth_returns401() throws Exception {
                mockMvc.perform(post("/orders"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getSessionWithoutAuth_returns401() throws Exception {
                mockMvc.perform(get("/api/sessions/{id}", 1L))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getSessionsByTourWithoutAuth_returns401() throws Exception {
                mockMvc.perform(get("/api/sessions/tour/{tourId}", 1L))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getSessionsByManagerWithoutAuth_returns401() throws Exception {
                mockMvc.perform(get("/api/sessions/manager/{managerId}", UUID.randomUUID()))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getOrderItemWithoutAuth_returns401() throws Exception {
                mockMvc.perform(get("/orders/items/{id}", 1L))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getPaymentByOrderWithoutAuth_returns401() throws Exception {
                mockMvc.perform(get("/payments/order/{orderId}", 1L))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getOrdersWithAuth_returns200() throws Exception {
                UUID userId = UUID.randomUUID();

                when(jwtService.validateAccessToken("good-token")).thenReturn(true);
                when(jwtService.getUserId("good-token")).thenReturn(userId);
                when(userDetailsService.loadUserById(userId))
                                .thenReturn(TestUserFactory.userWithRole("USER"));

                mockMvc.perform(get("/orders")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer good-token"))
                                .andExpect(status().isOk());
        }

        @Test
        void getShopPaymentsWithoutAuth_returns401() throws Exception {
                mockMvc.perform(get("/payments/shop/{shopId}", 1L))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getShopUsersWithoutAuth_returns401() throws Exception {
                mockMvc.perform(get("/api/shop-users/shop/{shopId}", 1L))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void createShopWithoutAuth_returns401() throws Exception {
                mockMvc.perform(post("/shops")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                  "name": "Test Shop"
                                                }
                                                """))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void requestJoinShopWithoutAuth_returns401() throws Exception {
                mockMvc.perform(post("/api/shop-users/shop/{shopId}/request", 1L))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void addShopUserWithoutAuth_returns401() throws Exception {
                mockMvc.perform(post("/api/shop-users/{shopId}/{userId}", 1L, UUID.randomUUID())
                                .param("role", "GUIDE"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getUserByIdWithoutAuth_returns401() throws Exception {
                mockMvc.perform(get("/api/users/{id}", UUID.randomUUID()))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getPublicManagerProfileWithoutAuth_returns200() throws Exception {
                UUID userId = UUID.randomUUID();

                when(userService.getPublicManagerProfile(userId))
                                .thenReturn(Result.ok(new PublicManagerProfileDto()));

                mockMvc.perform(get("/public/users/managers/{id}", userId))
                                .andExpect(status().isOk());
        }

        @Test
        void getActiveShopUsersWithoutAuth_returns401() throws Exception {
                mockMvc.perform(get("/api/shop-users/shop/{shopId}/active", 1L))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getPublicSessionStatsWithoutAuth_returns200() throws Exception {
                mockMvc.perform(get("/api/sessions/shops/{shopId}/stats/tours-given", 1L))
                                .andExpect(status().isOk());
        }

        @Test
        void getPublicActiveShopUsersWithoutAuth_returns200() throws Exception {
                mockMvc.perform(get("/api/shop-users/shop/{shopId}/active/public", 1L))
                                .andExpect(status().isOk());
        }

        @Test
        void getActuatorHealthWithoutAuth_isNotBlockedBySecurity() throws Exception {
                mockMvc.perform(get("/actuator/health"))
                                .andExpect(result -> {
                                        int responseStatus = result.getResponse().getStatus();
                                        assertNotEquals(401, responseStatus);
                                        assertNotEquals(403, responseStatus);
                                });
        }

        @Test
        void getActuatorPrometheusWithoutAuth_isNotBlockedBySecurity() throws Exception {
                mockMvc.perform(get("/actuator/prometheus"))
                                .andExpect(result -> {
                                        int responseStatus = result.getResponse().getStatus();
                                        assertNotEquals(401, responseStatus);
                                        assertNotEquals(403, responseStatus);
                                });
        }

        @Test
        void getActuatorMetricsWithoutAuth_returns401() throws Exception {
                mockMvc.perform(get("/actuator/metrics"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void patchShopStatusWithoutAuth_returns401() throws Exception {
                mockMvc.perform(patch("/shops/{shopId}/status", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                  "status": "DISABLED"
                                                }
                                                """))
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
        void userRoleBlockedFromCreateShopEndpoint_returns403() throws Exception {
                UUID userId = UUID.randomUUID();

                when(jwtService.validateAccessToken("good")).thenReturn(true);
                when(jwtService.getUserId("good")).thenReturn(userId);
                when(userDetailsService.loadUserById(userId))
                                .thenReturn(TestUserFactory.userWithRole("USER"));

                mockMvc.perform(post("/shops")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer good")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                  "name": "Test Shop"
                                                }
                                                """))
                                .andExpect(status().isForbidden());
        }

        @Test
        void userRoleBlockedFromJoinShopRequestEndpoint_returns403() throws Exception {
                UUID userId = UUID.randomUUID();

                when(jwtService.validateAccessToken("good")).thenReturn(true);
                when(jwtService.getUserId("good")).thenReturn(userId);
                when(userDetailsService.loadUserById(userId))
                                .thenReturn(TestUserFactory.userWithRole("USER"));

                mockMvc.perform(post("/api/shop-users/shop/{shopId}/request", 1L)
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
