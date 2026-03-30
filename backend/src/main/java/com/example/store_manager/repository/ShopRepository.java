package com.example.store_manager.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.Shop;
import com.example.store_manager.model.ShopStatus;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Long> {

        Optional<Shop> findByName(String name);

        Page<Shop> findByStatus(
                        ShopStatus status,
                        Pageable pageable);

        Page<Shop> findByStatusAndNameContainingIgnoreCase(
                        ShopStatus status,
                        String name,
                        Pageable pageable);

        @Query("""
                            SELECT s FROM Shop s
                            WHERE (:status IS NULL OR s.status = :status)
                            AND (
                                :query IS NULL OR :query = '' OR
                                LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR
                                CAST(s.id AS string) LIKE CONCAT('%', :query, '%')
                            )
                        """)
        Page<Shop> searchShops(
                        @Param("query") String query,
                        @Param("status") ShopStatus status,
                        Pageable pageable);
}