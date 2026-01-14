package com.example.store_manager.dto.tourSession;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import com.example.store_manager.model.SessionStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourSessionDetailsDto {

    private Long id;
    private Long tourId;

    // Schedule (source of truth)
    private LocalDate date;
    private LocalTime time;
    private int maxParticipants;
    private int bookedParticipants;
    private int remaining;

    // Session
    private SessionStatus status;

    // Manager
    private UUID managerId;
    private String managerName;

    // Bookings
    private List<OrderItemParticipantDto> participants;
}
