package com.example.store_manager.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.dto.finalize.FinalizeReservationDto;
import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.reserve.ReserveRequestDto;
import com.example.store_manager.dto.reserve.ReserveResponseDto;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.CustomUserDetails;
import com.example.store_manager.service.OrderService;
import com.example.store_manager.service.ReservationService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.example.store_manager.utility.ResultResponseMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;
    private final OrderService orderService;

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
                        order.getReservationToken()));
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

        return ResultResponseMapper.toResponse(
                orderService.finalizeReservation(
                        dto.orderId(),
                        dto.reservationToken()));
    }
}
