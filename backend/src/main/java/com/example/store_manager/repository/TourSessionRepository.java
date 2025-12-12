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

    Optional<TourSession> findByTourIdAndDateAndTime(Long tourId, LocalDate date, LocalTime time);

    List<TourSession> findByTourId(Long tourId);

    List<TourSession> findByTourIdIn(List<Long> tourIds);

    @EntityGraph(attributePaths = { "tour", "orderItems" })
    List<TourSession> findByManagerId(UUID managerId);
}
