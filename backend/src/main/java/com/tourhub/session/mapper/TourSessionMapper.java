package com.tourhub.session.mapper;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.tourhub.session.dto.OrderItemParticipantDto;
import com.tourhub.session.dto.TourSessionDetailsDto;
import com.tourhub.session.model.SessionStatus;
import com.tourhub.tour.model.TourSchedule;
import com.tourhub.session.model.TourSession;
import com.tourhub.order.mapper.OrderItemMapper;
import com.tourhub.order.model.OrderItem;
import com.tourhub.order.model.OrderStatus;

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
                                .managerEmail(session.getManager() != null ? session.getManager().getEmail() : null)
                                .managerRole(session.getManager() != null ? session.getManager().getRole() : null)
                                .participants(session.getOrderItems()
                                                .stream()
                                                .map(orderItemMapper::toDto)
                                                .toList())
                                .build();
        }

}
