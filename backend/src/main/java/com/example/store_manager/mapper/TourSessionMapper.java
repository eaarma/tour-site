package com.example.store_manager.mapper;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.store_manager.dto.tourSession.OrderItemParticipantDto;
import com.example.store_manager.dto.tourSession.TourSessionDto;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.model.TourSession;

@Component
public class TourSessionMapper {

    public TourSessionDto toDto(TourSession session) {
        return TourSessionDto.builder()
                .id(session.getId())
                .tourId(session.getTour().getId())
                .date(session.getDate())
                .time(session.getTime())
                .capacity(session.getCapacity())
                .remaining(session.getRemaining())
                .status(session.getStatus())
                .managerId(session.getManager() != null ? session.getManager().getId() : null)
                .managerName(session.getManager() != null ? session.getManager().getName() : null)
                .participants(
                        session.getOrderItems()
                                .stream()
                                .map(this::toParticipantDto)
                                .collect(Collectors.toList()))
                .build();
    }

    private OrderItemParticipantDto toParticipantDto(OrderItem item) {
        return OrderItemParticipantDto.builder()
                .orderItemId(item.getId())
                .name(item.getName())
                .participants(item.getParticipants())
                .status(item.getStatus())
                .pricePaid(item.getPricePaid())
                .managerId(item.getManager() != null ? item.getManager().getId() : null)
                .managerName(item.getManager() != null ? item.getManager().getName() : null)
                .email(item.getEmail())
                .phone(item.getPhone())
                .nationality(item.getNationality())
                .build();
    }

    public TourSession fromSchedule(TourSchedule schedule) {
        return TourSession.builder()
                .tour(schedule.getTour())
                .date(schedule.getDate())
                .time(schedule.getTime())
                .capacity(schedule.getMaxParticipants())
                .remaining(schedule.getMaxParticipants())
                .status(SessionStatus.PLANNED)
                .build();
    }
}
