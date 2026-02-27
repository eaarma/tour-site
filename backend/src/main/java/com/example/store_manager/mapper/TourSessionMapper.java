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

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TourSessionMapper {

        private final OrderItemMapper orderItemMapper;

        public TourSessionDetailsDto toDto(TourSession session) {

                TourSchedule schedule = session.getSchedule();

                int max = schedule.getMaxParticipants();
                int booked = schedule.getBookedParticipants();

                return TourSessionDetailsDto.builder()
                                .id(session.getId())
                                // 📅 from schedule (single source of truth)
                                .date(schedule.getDate())
                                .time(schedule.getTime())
                                .scheduleId(schedule.getId())
                                .maxParticipants(max)
                                .bookedParticipants(booked)
                                .remaining(max - booked)
                                .status(session.getStatus())
                                .tourId(session.getSchedule().getTour().getId())
                                .tourTitle(session.getSchedule().getTour().getTitle())
                                .tourLocation(session.getSchedule().getTour().getLocation())
                                .tourMeetingPoint(session.getSchedule().getTour().getMeetingPoint())
                                .shopId(session.getSchedule().getTour().getShop().getId())
                                .managerId(session.getManager() != null
                                                ? session.getManager().getId()
                                                : null)
                                .managerName(session.getManager() != null
                                                ? session.getManager().getName()
                                                : null)
                                .participants(
                                                session.getOrderItems()
                                                                .stream()
                                                                .map(orderItemMapper::toDto)
                                                                .toList())
                                .build();
        }

}
