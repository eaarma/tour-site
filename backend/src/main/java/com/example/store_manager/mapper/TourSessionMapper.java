package com.example.store_manager.mapper;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.store_manager.dto.tourSession.OrderItemParticipantDto;
import com.example.store_manager.dto.tourSession.TourSessionDetailsDto;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.model.TourSession;

@Component
public class TourSessionMapper {

        public TourSessionDetailsDto toDto(TourSession session) {

                TourSchedule schedule = session.getSchedule();

                int max = schedule.getMaxParticipants();
                int booked = schedule.getBookedParticipants();

                return TourSessionDetailsDto.builder()
                                .id(session.getId())
                                .tourId(schedule.getTour().getId())

                                // 📅 from schedule (single source of truth)
                                .date(schedule.getDate())
                                .time(schedule.getTime())
                                .maxParticipants(max)
                                .bookedParticipants(booked)
                                .remaining(max - booked)

                                // 📌 from session
                                .status(session.getStatus())

                                // 👤 manager
                                .managerId(session.getManager() != null
                                                ? session.getManager().getId()
                                                : null)
                                .managerName(session.getManager() != null
                                                ? session.getManager().getName()
                                                : null)

                                // 👥 participants
                                .participants(
                                                session.getOrderItems()
                                                                .stream()
                                                                .map(this::toParticipantDto)
                                                                .toList())
                                .build();
        }

        private OrderItemParticipantDto toParticipantDto(OrderItem item) {
                return OrderItemParticipantDto.builder()
                                .orderItemId(item.getId())
                                .name(item.getName())
                                .participants(item.getParticipants())
                                .status(item.getStatus())
                                .pricePaid(item.getPricePaid())
                                .managerId(item.getManager() != null
                                                ? item.getManager().getId()
                                                : null)
                                .managerName(item.getManager() != null
                                                ? item.getManager().getName()
                                                : null)
                                .email(item.getEmail())
                                .phone(item.getPhone())
                                .nationality(item.getNationality())
                                .build();
        }
}
