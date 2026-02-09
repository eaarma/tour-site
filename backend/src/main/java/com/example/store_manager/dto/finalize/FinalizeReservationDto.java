package com.example.store_manager.dto.finalize;

public record FinalizeReservationDto(
        Long orderId,
        String reservationToken) {
}
