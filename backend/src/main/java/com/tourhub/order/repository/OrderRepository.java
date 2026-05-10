package com.tourhub.order.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tourhub.order.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
        // Fetch all orders for a specific user
        List<Order> findByUserId(UUID userId);

        @Query("""
                            SELECT o FROM Order o
                            WHERE o.status IN ('RESERVED', 'FINALIZED')
                            AND o.expiresAt < :now
                        """)
        List<Order> findExpiredReservations(@Param("now") Instant now);

        Optional<Order> findByIdAndReservationToken(
                        Long id,
                        UUID reservationToken);

        @Query("""
                        select o
                        from Order o
                        left join fetch o.orderItems
                        where o.id = :id
                        """)
        Optional<Order> findByIdWithItems(@Param("id") Long id);

        Optional<Order> findByCancellationTokenHash(String hash);
}
