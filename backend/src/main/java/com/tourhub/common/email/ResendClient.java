package com.tourhub.common.email;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ResendClient {

    @Value("${resend.api-key:dummy-test-key}")
    private String apiKey;

    @Value("${resend.from-email:info@tourhub.space}")
    private String fromEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendEmail(String to, String subject, String html) {
        sendEmail(to, subject, html, null);
    }

    public void sendEmail(String to, String subject, String html, String replyTo) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("from", "TourHub <" + fromEmail + ">");
        body.put("to", new String[] { to });
        body.put("subject", subject);
        body.put("html", html);

        if (replyTo != null && !replyTo.isBlank()) {
            body.put("reply_to", replyTo.trim());
        }

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                "https://api.resend.com/emails",
                request,
                String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("Resend rejected the email request");
        }
    }
}
