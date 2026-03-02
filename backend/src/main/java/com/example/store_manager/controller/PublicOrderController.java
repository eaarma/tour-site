package com.example.store_manager.controller;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.store_manager.dto.booking.CancelBookingRequestDto;
import com.example.store_manager.dto.booking.CancelBookingResponseDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.mapper.OrderMapper;
import com.example.store_manager.model.CancelledBy;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.repository.OrderItemRepository;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.service.BookingAccessTokenService;
import com.example.store_manager.service.CancellationService;
import com.example.store_manager.utility.Result;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/public/orders")
@RequiredArgsConstructor
public class PublicOrderController {

        private final BookingAccessTokenService tokenService;
        private final CancellationService cancellationService;
        private final OrderItemRepository orderItemRepository;
        private final OrderMapper orderMapper;

        @GetMapping("/manage")
        public ResponseEntity<OrderResponseDto> getOrderByToken(
                        @RequestParam String token) {

                Order order = tokenService.requireValidOrder(token);

                return ResponseEntity.ok(orderMapper.toDto(order));
        }

        @PostMapping("/items/{orderItemId}/cancel")
        public ResponseEntity<CancelBookingResponseDto> cancelOrderItem(
                        @PathVariable Long orderItemId,
                        @Valid @RequestBody CancelBookingRequestDto req) {

                Order order = tokenService.requireValidOrder(req.getToken());

                OrderItem item = orderItemRepository.findByIdWithOrder(orderItemId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Invalid link"));

                if (!item.getOrder().getId().equals(order.getId())) {
                        throw new ResponseStatusException(
                                        HttpStatus.NOT_FOUND, "Invalid link");
                }

                Result<CancellationService.CancellationResult> result = cancellationService.cancelOrderItem(
                                orderItemId,
                                CancelledBy.GUEST,
                                req.getReasonType(),
                                req.getReason());

                if (result.isFail()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        result.getErrorOrThrow().message());
                }

                var r = result.get();

                // Optional: consume only if all items cancelled
                boolean allCancelled = order.getOrderItems().stream()
                                .allMatch(i -> i.getStatus() == OrderStatus.CANCELLED);

                if (allCancelled) {
                        tokenService.consumeToken(order);
                }

                return ResponseEntity.ok(
                                new CancelBookingResponseDto(
                                                order.getId(),
                                                orderItemId,
                                                r.refundable(),
                                                r.refundAmount(),
                                                r.newStatus()));
        }
}