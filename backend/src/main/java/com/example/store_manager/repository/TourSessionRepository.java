package com.example.store_manager.repository;

import com.example.store_manager.model.TourSession;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface TourSessionRepository extends JpaRepository<TourSession, Long> {

    Optional<TourSession> findByScheduleId(Long scheduleId);

    List<TourSession> findBySchedule_Tour_Id(Long tourId);

    List<TourSession> findBySchedule_Tour_IdIn(List<Long> tourIds);

    @EntityGraph(attributePaths = { "schedule", "orderItems", "manager" })
    List<TourSession> findByManagerId(UUID managerId);
}
