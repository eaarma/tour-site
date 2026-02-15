package com.example.store_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import lombok.RequiredArgsConstructor;
import com.example.store_manager.service.StripeService;
import com.example.store_manager.utility.ResultResponseMapper;

@RestController
@RequestMapping("/checkout/stripe")
@RequiredArgsConstructor
public class StripeController {

    private final StripeService stripeService;

    @PostMapping("/intent/{orderId}")
    public ResponseEntity<?> createIntent(
            @PathVariable("orderId") Long orderId) {

        return ResultResponseMapper.toResponse(
                stripeService.createPaymentIntent(orderId));
    }
}
