package com.example.store_manager.repository;

import java.math.BigDecimal;
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

    Optional<Payment> findByOrderId(Long orderId);

    @Query("""
                SELECT DISTINCT p
                FROM Payment p
                JOIN p.order o
                JOIN o.orderItems oi
                WHERE oi.shopId = :shopId
                  AND p.status = 'SUCCEEDED'
                  AND p.payout IS NULL
            """)
    List<Payment> findUnpaidByShopId(
            @Param("shopId") Long shopId);

    @Query("""
                SELECT COALESCE(SUM(p.shopAmount), 0)
                FROM Payment p
                JOIN p.order o
                JOIN o.orderItems i
                WHERE i.shopId = :shopId
                  AND p.payout IS NULL
                  AND p.status = 'SUCCEEDED'
            """)
    BigDecimal sumUnpaidByShopId(@Param("shopId") Long shopId);

    @Query("""
                SELECT DISTINCT p
                FROM Payment p
                JOIN p.order o
                JOIN o.orderItems i
                WHERE i.shopId = :shopId
                ORDER BY p.createdAt DESC
            """)
    Page<Payment> findHistoryByShopId(@Param("shopId") Long shopId, Pageable pageable);

    @Query("""
                SELECT p
                FROM Payment p
                WHERE p.payout IS NULL
                  AND p.status = 'SUCCEEDED'
            """)
    List<Payment> findReadyForPayout();

    List<Payment> findByPayoutId(Long payoutId);

}
