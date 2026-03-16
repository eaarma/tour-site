package com.example.store_manager.repository;

import com.example.store_manager.model.TourSession;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
                SELECT COUNT(ts)
                FROM TourSession ts
                JOIN ts.schedule sch
                JOIN sch.tour t
                WHERE t.shop.id = :shopId
                AND ts.status = com.example.store_manager.model.SessionStatus.COMPLETED
            """)
    long countCompletedSessionsByShop(@Param("shopId") Long shopId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
                SELECT ts
                FROM TourSession ts
                LEFT JOIN FETCH ts.schedule
                LEFT JOIN FETCH ts.manager
                WHERE ts.id = :id
            """)
    Optional<TourSession> findByIdForUpdate(@Param("id") Long id);

    @Query("""
                SELECT DISTINCT s
                FROM TourSession s
                JOIN FETCH s.schedule sch
                JOIN FETCH sch.tour t
                LEFT JOIN FETCH s.orderItems oi
                WHERE t.shop.id = :shopId
            """)
    List<TourSession> findByShopIdWithParticipants(@Param("shopId") Long shopId);

}
