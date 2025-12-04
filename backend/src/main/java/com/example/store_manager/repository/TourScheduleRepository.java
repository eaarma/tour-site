package com.example.store_manager.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.model.TourSchedule;

public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {

    List<TourSchedule> findByTourId(Long tourId);

    List<TourSchedule> findByStatus(String status);

    List<TourSchedule> findByTourIdAndStatus(Long tourId, String status);

    @Modifying
    @Transactional
    @Query("UPDATE TourSchedule s SET s.status = 'EXPIRED' " +
            "WHERE s.status = 'ACTIVE' AND " +
            "(s.date < :today OR (s.date = :today AND s.time IS NOT NULL AND s.time < :now))")
    int markExpiredSchedules(LocalDate today, LocalTime now);

    @Query("""
                SELECT s.tour.shop.id
                FROM TourSchedule s
                WHERE s.id = :scheduleId
            """)
    Long findShopIdByScheduleId(@Param("scheduleId") Long scheduleId);
}