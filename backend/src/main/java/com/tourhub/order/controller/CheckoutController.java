package com.tourhub.order.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tourhub.security.CustomUserDetails;
import com.tourhub.payment.service.StripeService;
import com.tourhub.user.model.User;
import com.tourhub.user.repository.UserRepository;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.tourhub.common.result.ResultResponseMapper;
import com.tourhub.order.dto.FinalizeReservationDto;
import com.tourhub.order.dto.OrderCreateRequestDto;
import com.tourhub.order.dto.OrderStatusDto;
import com.tourhub.order.dto.ReserveResponseDto;
import com.tourhub.order.model.Order;
import com.tourhub.order.service.OrderService;
import com.tourhub.order.service.ReservationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final StripeService stripeService;

    @PostMapping("/reserve")
    public ResponseEntity<?> reserve(
            @RequestBody OrderCreateRequestDto request,
            Authentication authentication) {

        User user = null;

        if (authentication != null &&
                authentication.getPrincipal() instanceof CustomUserDetails details) {

            user = userRepository.findById(details.getId()).orElse(null);
        }

        Result<Order> result = reservationService.reserve(request, user);

        if (result.isFail()) {
            ApiError error = result.error();

            return ResponseEntity
                    .status(mapStatus(error))
                    .body(error);
        }

        Order order = result.get();

        return ResponseEntity.ok(
                new ReserveResponseDto(
                        order.getId(),
                        order.getExpiresAt(),
                        order.getStatus(),
                        order.getReservationToken().toString()));
    }

    private HttpStatus mapStatus(ApiError error) {
        if (error.isNotFound())
            return HttpStatus.NOT_FOUND;
        if (error.isBadRequest())
            return HttpStatus.BAD_REQUEST;
        if (error.isForbidden())
            return HttpStatus.FORBIDDEN;
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    @PostMapping("/finalize")
    public ResponseEntity<?> finalizeReservation(
            @RequestBody FinalizeReservationDto dto) {

        UUID token = UUID.fromString(dto.reservationToken());

        return ResultResponseMapper.toResponse(
                orderService.finalizeReservation(
                        dto.orderId(),
                        token));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getStatus(
            @PathVariable Long id,
            @RequestParam UUID token) {

        Result<OrderStatusDto> result = orderService.getReservationStatus(id, token);

        if (result.isFail()) {
            ApiError error = result.error();

            return ResponseEntity
                    .status(mapStatus(error))
                    .body(error);
        }

        return ResponseEntity.ok(result.get());
    }

    @PostMapping("/{orderId}/pay")
    public ResponseEntity<?> createPayment(
            @PathVariable Long orderId,
            @RequestParam(value = "token", required = false) String token,
            Authentication authentication) {

        Result<String> result = stripeService.createPaymentIntent(orderId, authentication, token);

        if (result.isFail()) {
            ApiError error = result.error();

            return ResponseEntity
                    .status(mapStatus(error))
                    .body(error);
        }

        return ResponseEntity.ok(
                Map.of("clientSecret", result.get()));
    }

}


