package com.tourhub.order.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tourhub.order.dto.CancelBookingRequestDto;
import com.tourhub.order.dto.CancelBookingResponseDto;
import com.tourhub.order.dto.OrderCreateRequestDto;
import com.tourhub.order.dto.OrderItemResponseDto;
import com.tourhub.order.dto.OrderResponseDto;
import com.tourhub.order.dto.StatusUpdateRequestDto;
import com.tourhub.order.model.CancelledBy;
import com.tourhub.order.model.OrderItem;
import com.tourhub.payment.model.PaymentLine;
import com.tourhub.payment.repository.PaymentLineRepository;
import com.tourhub.security.CustomUserDetails;
import com.tourhub.order.service.CancellationService;
import com.tourhub.order.service.OrderService;
import com.tourhub.common.result.Result;
import com.tourhub.common.result.ResultResponseMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

        private final OrderService orderService;
        private final CancellationService cancellationService;
        private final PaymentLineRepository paymentLineRepository;

        @GetMapping("/admin")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> getOrdersForAdmin(
                        @RequestParam(name = "query", required = false) String query,
                        @RequestParam(name = "status", required = false) String status,
                        @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate from,
                        @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate to,
                        @RequestParam(name = "page", defaultValue = "0") int page,
                        @RequestParam(name = "size", defaultValue = "10") int size) {

                return ResultResponseMapper.toResponse(
                                orderService.searchOrdersForAdmin(query, status, from, to, page, size));
        }

        @PostMapping
        public ResponseEntity<?> createOrder(
                        @RequestBody @Valid OrderCreateRequestDto dto) {

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();

                UUID userId = null;
                if (auth != null && auth.isAuthenticated()
                                && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
                        userId = userDetails.getId();
                }

                return ResultResponseMapper.toResponse(
                                orderService.createOrder(dto, userId));
        }

        @GetMapping("/{id}")
        public ResponseEntity<?> getOrderById(
                        @PathVariable("id") Long id,
                        @RequestParam(value = "token", required = false) String token,
                        Authentication auth) {

                return ResultResponseMapper.toResponse(
                                orderService.getOrderById(id, auth, token));
        }

        @GetMapping
        public ResponseEntity<?> getUserOrders() {

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                UUID userId = null;

                if (auth != null
                                && auth.isAuthenticated()
                                && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
                        userId = userDetails.getId();
                }

                return ResultResponseMapper.toResponse(
                                orderService.getOrdersByUser(userId));
        }

        @GetMapping("/shop/{shopId}/items")
        public ResponseEntity<?> getOrderItemsByShop(@PathVariable("shopId") Long shopId) {
                return ResultResponseMapper.toResponse(
                                orderService.getOrderItemsByShop(shopId));
        }

        @GetMapping("/items/{id}")
        public ResponseEntity<?> getOrderItem(@PathVariable("id") Long id) {
                return ResultResponseMapper.toResponse(
                                orderService.getOrderItemById(id));
        }

        @PatchMapping("/items/{itemId}/status")
        public ResponseEntity<?> updateOrderItemStatus(
                        @PathVariable Long itemId,
                        @RequestBody StatusUpdateRequestDto request) {

                return ResultResponseMapper.toResponse(
                                orderService.updateOrderItemStatus(itemId, request.getStatus()));
        }

        @PostMapping("/items/{orderItemId}/cancel")
        public ResponseEntity<?> cancelMyOrderItem(
                        @PathVariable("orderItemId") Long orderItemId,
                        @RequestBody(required = false) CancelBookingRequestDto req) {

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();

                if (auth == null || !auth.isAuthenticated() ||
                                !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }

                UUID userId = userDetails.getId();

                Result<OrderItemResponseDto> itemResult = orderService.getOrderItemById(orderItemId);

                if (itemResult.isFail()) {
                        return ResultResponseMapper.toResponse(itemResult);
                }

                var itemEntityResult = orderService.getOrderItemEntity(orderItemId);

                if (itemEntityResult.isFail()) {
                        return ResultResponseMapper.toResponse(itemEntityResult);
                }

                var item = itemEntityResult.get();

                if (item.getOrder().getUser() == null ||
                                !item.getOrder().getUser().getId().equals(userId)) {

                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                Result<CancellationService.CancellationResult> result = cancellationService.cancelOrderItem(
                                item,
                                CancelledBy.USER,
                                req != null ? req.getReasonType() : null,
                                req != null ? req.getReason() : null);

                if (result.isFail()) {
                        return ResponseEntity
                                        .status(HttpStatus.BAD_REQUEST)
                                        .body(result.getErrorOrThrow());
                }

                var r = result.get();

                return ResponseEntity.ok(
                                new CancelBookingResponseDto(
                                                item.getOrder().getId(),
                                                orderItemId,
                                                r.refundable(),
                                                r.refundAmount(),
                                                r.newStatus()));
        }

        @GetMapping("/manager/{managerId}/items")
        public ResponseEntity<?> getOrderItemsByManager(
                        @PathVariable("managerId") UUID managerId) {

                return ResultResponseMapper.toResponse(
                                orderService.getOrderItemsByManager(managerId));
        }

        @PatchMapping("/items/{itemId}/confirm/{managerId}")
        public ResponseEntity<?> confirmOrderItem(
                        @PathVariable("itemId") Long itemId,
                        @PathVariable("managerId") UUID managerId) {

                return ResultResponseMapper.toResponse(
                                orderService.confirmOrderItem(itemId, managerId));
        }

        @PatchMapping("/items/{itemId}/assign")
        public ResponseEntity<?> assignManagerToOrderItem(
                        @PathVariable("itemId") Long itemId,
                        @RequestBody(required = false) Map<String, UUID> body) {

                UUID managerId = body != null ? body.get("managerId") : null;

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || !auth.isAuthenticated() ||
                                !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }

                UUID actingUserId = userDetails.getId();
                String actingUserRole = userDetails.getRole();

                return ResultResponseMapper.toResponse(
                                orderService.assignManagerToOrderItem(
                                                itemId,
                                                managerId,
                                                actingUserId,
                                                actingUserRole));
        }

        @GetMapping("/user/{userId}/items")
        public ResponseEntity<?> getOrderItemsByUser(@PathVariable("userId") UUID userId) {
                return ResultResponseMapper.toResponse(
                                orderService.getOrderItemsByUser(userId));
        }

        // Guest checkout does not require authentication.
        @PostMapping("/guest")
        public ResponseEntity<?> createGuestOrder(
                        @RequestBody @Valid OrderCreateRequestDto dto) {

                return ResultResponseMapper.toResponse(
                                orderService.createOrder(dto, null));
        }

}


