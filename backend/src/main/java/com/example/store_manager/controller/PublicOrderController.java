package com.example.store_manager.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.service.BookingAccessTokenService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/orders")
@RequiredArgsConstructor
public class PublicOrderController {

    private final BookingAccessTokenService tokenService;
    private final OrderRepository orderRepository;

    @GetMapping("/manage")
    public ResponseEntity<Void> validateToken(@RequestParam String token) {

        String hash = tokenService.hash(token);

        boolean exists = orderRepository
                .existsByCancellationTokenHash(hash);

        if (!exists) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok().build();
    }
}