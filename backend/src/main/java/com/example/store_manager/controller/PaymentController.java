package com.example.store_manager.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.example.store_manager.dto.payment.PaymentLineResponseDto;
import com.example.store_manager.service.PaymentService;
import com.example.store_manager.utility.Result;
import com.example.store_manager.utility.ResultResponseMapper;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

        private final PaymentService paymentService;

        @GetMapping("/{id}")
        public ResponseEntity<?> getById(@PathVariable Long id) {
                return ResultResponseMapper.toResponse(
                                paymentService.getById(id));
        }

        @GetMapping("/order/{orderId}")
        public ResponseEntity<?> getByOrderId(@PathVariable Long orderId) {
                return ResultResponseMapper.toResponse(
                                paymentService.getByOrderId(orderId));
        }

        @GetMapping("/shop/{shopId}")
        public ResponseEntity<?> getShopPayments(@PathVariable("shopId") Long shopId) {
                Result<List<PaymentLineResponseDto>> result = paymentService.getShopPayments(shopId);

                if (result.isFail()) {
                        return ResponseEntity.badRequest().body(result.error());
                }

                return ResponseEntity.ok(result.get());
        }

}
