package com.example.store_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.Payout;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, Long> {
    @Query("""
            select p
            from Payout p
            where p.shopId = :shopId
            order by p.paidAt desc, p.createdAt desc, p.id desc
            """)
    List<Payout> findAllForShop(@Param("shopId") Long shopId);
}
