package com.example.store_manager.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.store_manager.service.EmailService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EmailService emailService;

    @Test
    void submit_returnsOk_whenForwardedSuccessfully() throws Exception {
        doNothing().when(emailService).sendContactMessage(anyString(), anyString(), anyString(), anyString());

        mockMvc.perform(post("/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "Test User",
                          "email": "user@example.com",
                          "subject": "Booking question",
                          "message": "Hello from the contact form"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void submit_returnsInternalServerError_whenConfigurationIsMissing() throws Exception {
        doThrow(new IllegalStateException("Contact receiver email is not configured."))
                .when(emailService)
                .sendContactMessage(anyString(), anyString(), anyString(), anyString());

        mockMvc.perform(post("/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "Test User",
                          "email": "user@example.com",
                          "subject": "Booking question",
                          "message": "Hello from the contact form"
                        }
                        """))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Contact receiver email is not configured."));
    }

    @Test
    void submit_returnsBadRequest_whenRequiredFieldsAreMissing() throws Exception {
        mockMvc.perform(post("/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "",
                          "email": "",
                          "message": ""
                        }
                        """))
                .andExpect(status().isBadRequest());
    }
}
