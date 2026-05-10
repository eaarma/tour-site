package com.tourhub.payment.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tourhub.payment.service.PaymentService;
import com.tourhub.common.result.ResultResponseMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/public/payments")
@RequiredArgsConstructor
public class PublicPaymentController {

    private final PaymentService paymentService;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getByOrderId(
            @PathVariable("orderId") Long orderId,
            @RequestParam("token") String token) {
        return ResultResponseMapper.toResponse(
                paymentService.getPublicByOrderId(orderId, token));
    }
}

