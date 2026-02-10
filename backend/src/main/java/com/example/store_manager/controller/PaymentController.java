package com.example.store_manager.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.example.store_manager.dto.payment.PaymentDto;
import com.example.store_manager.dto.payment.PaymentResponseDto;
import com.example.store_manager.mapper.PaymentMapper;
import com.example.store_manager.model.Payment;
import com.example.store_manager.service.PaymentService;
import com.example.store_manager.utility.ResultResponseMapper;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable("id") Long id) {

        return ResultResponseMapper.toResponse(
                paymentService.getById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getByOrderId(
            @PathVariable("orderId") Long orderId) {

        return ResultResponseMapper.toResponse(
                paymentService.getByOrderId(orderId));
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<?> getByShop(
            @PathVariable("shopId") Long shopId) {

        return ResultResponseMapper.toResponse(
                paymentService.getByShop(shopId));
    }
}
