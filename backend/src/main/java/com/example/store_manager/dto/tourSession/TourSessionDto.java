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

@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourSessionDto {
    private Long id;
    private Long tourId;

    private LocalDate date;
    private LocalTime time;

    private int capacity;
    private int remaining;

    private List<OrderItemParticipantDto> participants;

    private SessionStatus status; // PLANNED/CONFIRMED/COMPLETED/CANCELLED/CANCELLED_CONFIRMED
    private UUID managerId;
    private String managerName;
}
