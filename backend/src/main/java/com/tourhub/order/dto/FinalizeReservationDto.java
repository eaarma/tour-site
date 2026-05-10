package com.tourhub.order.dto;

public record FinalizeReservationDto(
        Long orderId,
        String reservationToken) {
}
