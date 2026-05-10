package com.tourhub.order.controller;

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

import com.tourhub.order.dto.CancelBookingRequestDto;
import com.tourhub.order.dto.CancelBookingResponseDto;
import com.tourhub.order.dto.OrderResponseDto;
import com.tourhub.order.mapper.OrderMapper;
import com.tourhub.order.model.CancelledBy;
import com.tourhub.order.model.Order;
import com.tourhub.order.model.OrderItem;
import com.tourhub.order.model.OrderStatus;
import com.tourhub.order.repository.OrderItemRepository;
import com.tourhub.payment.repository.PaymentLineRepository;
import com.tourhub.order.service.BookingAccessTokenService;
import com.tourhub.order.service.CancellationService;
import com.tourhub.common.result.Result;

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
                        @RequestParam(name = "token") String token) {

                Order order = tokenService.requireValidOrder(token);

                return ResponseEntity.ok(orderMapper.toDto(order));
        }

        @PostMapping("/items/{orderItemId}/cancel")
        public ResponseEntity<CancelBookingResponseDto> cancelOrderItem(
                        @PathVariable("orderItemId") Long orderItemId,
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
                                item,
                                CancelledBy.GUEST,
                                req.getReasonType(),
                                req.getReason());

                if (result.isFail()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        result.getErrorOrThrow().message());
                }

                var r = result.get();

                boolean allCancelled = order.getOrderItems().stream()
                                .allMatch(i -> i.getStatus() == OrderStatus.CANCELLED ||
                                                i.getStatus() == OrderStatus.CANCELLED_CONFIRMED);

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

