package com.tourhub.session.dto;

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

import com.tourhub.order.dto.OrderItemResponseDto;
import com.tourhub.user.model.Role;
import com.tourhub.session.model.SessionStatus;

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
    private long scheduleId;
    private String tourLocation;
    private String tourTitle;
    private String tourMeetingPoint;
    private Long shopId;

    // Session
    private SessionStatus status;

    // Manager
    private UUID managerId;
    private String managerName;
    private String managerEmail;
    private Role managerRole;

    // Bookings
    private List<OrderItemResponseDto> participants;
}
