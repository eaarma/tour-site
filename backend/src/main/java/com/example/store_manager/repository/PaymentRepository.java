package com.example.store_manager.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Find payment created for a specific order.
     * 1:1 relationship between Order and Payment.
     */
    Optional<Payment> findByOrderId(Long orderId);

    /**
     * Payment history for a shop.
     * Returns parent payments that contain at least one line
     * belonging to the shop.
     */
    @Query("""
                SELECT DISTINCT p
                FROM Payment p
                JOIN p.paymentLines pl
                WHERE pl.shopId = :shopId
                ORDER BY p.createdAt DESC
            """)
    Page<Payment> findHistoryByShopId(
            @Param("shopId") Long shopId,
            Pageable pageable);

    @Query("""
            SELECT p FROM Payment p
            WHERE p.status = com.example.store_manager.model.PaymentStatus.PENDING
            AND p.createdAt < :cutoff
            """)
    List<Payment> findExpiredPendingPayments(@Param("cutoff") Instant cutoff);

}
