package com.example.store_manager.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.PaymentLine;

@Repository
public interface PaymentLineRepository extends JpaRepository<PaymentLine, Long> {

  @Query("""
          SELECT pl
          FROM PaymentLine pl
          JOIN FETCH pl.payment p
          JOIN FETCH pl.orderItem oi
          JOIN FETCH oi.order o
          WHERE pl.shopId = :shopId
            AND pl.status = 'SUCCEEDED'
            AND pl.payout IS NULL
          ORDER BY pl.createdAt DESC
      """)
  List<PaymentLine> findUnpaidByShopId(@Param("shopId") Long shopId);

  @Query("""
          SELECT COALESCE(SUM(pl.shopAmount), 0)
          FROM PaymentLine pl
          WHERE pl.shopId = :shopId
            AND pl.payout IS NULL
            AND pl.status = 'SUCCEEDED'
      """)
  BigDecimal sumUnpaidByShopId(@Param("shopId") Long shopId);

  Page<PaymentLine> findByShopIdOrderByCreatedAtDesc(Long shopId, Pageable pageable);

}
