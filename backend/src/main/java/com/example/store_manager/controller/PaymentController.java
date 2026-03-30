package com.example.store_manager.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

        @GetMapping("/admin")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> getPaymentLinesForAdmin(
                        @RequestParam(name = "query", required = false) String query,
                        @RequestParam(name = "status", required = false) String status,
                        @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                        @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                        @RequestParam(name = "page", defaultValue = "0") int page,
                        @RequestParam(name = "size", defaultValue = "10") int size) {
                return ResultResponseMapper.toResponse(
                                paymentService.searchPaymentLinesForAdmin(query, status, from, to, page, size));
        }

        @GetMapping("/{id}")
        public ResponseEntity<?> getById(@PathVariable("id") Long id) {
                return ResultResponseMapper.toResponse(
                                paymentService.getById(id));
        }

        @GetMapping("/order/{orderId}")
        public ResponseEntity<?> getByOrderId(@PathVariable("orderId") Long orderId) {
                return ResultResponseMapper.toResponse(
                                paymentService.getByOrderId(orderId));
        }

        @GetMapping("/shop/{shopId}")
        public ResponseEntity<?> getShopPaymentLines(@PathVariable("shopId") Long shopId) {
                Result<List<PaymentLineResponseDto>> result = paymentService.getShopPaymentLines(shopId);

                if (result.isFail()) {
                        return ResponseEntity.badRequest().body(result.error());
                }

                return ResponseEntity.ok(result.get());
        }

}
