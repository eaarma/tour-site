package com.example.store_manager.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.PaymentLine;
import com.example.store_manager.model.PaymentStatus;

import jakarta.persistence.LockModeType;

@Repository
public interface PaymentLineRepository extends JpaRepository<PaymentLine, Long> {
  @Query("""
          SELECT pl
          FROM PaymentLine pl
          JOIN FETCH pl.payment p
          JOIN FETCH pl.orderItem oi
          JOIN FETCH oi.order o
          WHERE pl.shopId = :shopId
            AND pl.status = :status
            AND pl.payout IS NULL
          ORDER BY pl.createdAt DESC
      """)
  List<PaymentLine> findUnpaidByShopId(@Param("shopId") Long shopId,
      @Param("status") PaymentStatus status);

  @Query("""
          SELECT COALESCE(SUM(pl.shopAmount), 0.00)
          FROM PaymentLine pl
          WHERE pl.shopId = :shopId
            AND pl.payout IS NULL
            AND pl.status = com.example.store_manager.model.PaymentStatus.SUCCEEDED
      """)
  BigDecimal sumUnpaidByShopId(@Param("shopId") Long shopId);

  Page<PaymentLine> findByShopIdOrderByCreatedAtDesc(Long shopId, Pageable pageable);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT pl FROM PaymentLine pl WHERE pl.orderItem.id = :orderItemId")
  Optional<PaymentLine> findByOrderItemIdForUpdate(@Param("orderItemId") Long orderItemId);

}
