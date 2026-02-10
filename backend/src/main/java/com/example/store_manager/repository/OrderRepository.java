package com.example.store_manager.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Fetch all orders for a specific user
    List<Order> findByUserId(UUID userId);

    @Query("""
                SELECT o FROM Order o
                WHERE o.status = 'RESERVED'
                AND o.expiresAt < :now
            """)
    List<Order> findExpiredReservations(@Param("now") Instant now);

    Optional<Order> findByIdAndReservationToken(
            Long id,
            UUID reservationToken);

}