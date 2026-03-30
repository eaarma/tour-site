package com.example.store_manager.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.Nullable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.PaymentLine;
import com.example.store_manager.model.PaymentLineType;
import com.example.store_manager.model.PaymentStatus;

import jakarta.persistence.LockModeType;

@Repository
public interface PaymentLineRepository extends JpaRepository<PaymentLine, Long>, JpaSpecificationExecutor<PaymentLine> {
  @Override
  @EntityGraph(attributePaths = { "payment", "orderItem", "orderItem.order", "orderItem.session", "session" })
  Page<PaymentLine> findAll(@Nullable Specification<PaymentLine> spec, Pageable pageable);

  @Override
  @EntityGraph(attributePaths = {
      "payment",
      "payout",
      "orderItem",
      "orderItem.order",
      "orderItem.session",
      "orderItem.session.schedule",
      "orderItem.session.schedule.tour",
      "session",
      "session.schedule",
      "session.schedule.tour"
  })
  List<PaymentLine> findAll(@Nullable Specification<PaymentLine> spec, Sort sort);

  @Query("""
          SELECT pl
          FROM PaymentLine pl
          LEFT JOIN FETCH pl.payment p
          LEFT JOIN FETCH pl.orderItem oi
          LEFT JOIN FETCH oi.order o
          WHERE pl.shopId = :shopId
            AND pl.status = :status
            AND pl.payout IS NULL
          ORDER BY pl.createdAt DESC
      """)
  List<PaymentLine> findUnpaidByShopId(
      @Param("shopId") Long shopId,
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

  boolean existsByOrderItemIdAndType(Long orderItemId, PaymentLineType type);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("""
            SELECT pl
            FROM PaymentLine pl
            WHERE pl.orderItem.id = :orderItemId
              AND pl.type = com.example.store_manager.model.PaymentLineType.SALE
      """)
  Optional<PaymentLine> findSaleLineForUpdate(@Param("orderItemId") Long orderItemId);

  @Query("""
          SELECT pl
          FROM PaymentLine pl
          WHERE pl.orderItem.id IN :orderItemIds
          AND pl.type = 'SALE'
      """)
  List<PaymentLine> findSaleLinesForOrderItems(@Param("orderItemIds") List<Long> orderItemIds);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("""
          SELECT pl
          FROM PaymentLine pl
          WHERE pl.shopId = :shopId
            AND pl.payout IS NULL
            AND pl.status = com.example.store_manager.model.PaymentStatus.SUCCEEDED
            AND pl.type IN (
              com.example.store_manager.model.PaymentLineType.SALE,
              com.example.store_manager.model.PaymentLineType.REFUND,
              com.example.store_manager.model.PaymentLineType.CANCELLATION_FEE
            )
            AND pl.createdAt >= :from
            AND pl.createdAt <= :to
          ORDER BY pl.createdAt ASC, pl.id ASC
      """)
  List<PaymentLine> findEligibleForPayout(
      @Param("shopId") Long shopId,
      @Param("from") Instant from,
      @Param("to") Instant to);
}
