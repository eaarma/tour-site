package com.example.store_manager.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.store_manager.model.Tour;

public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByShopId(Long shopId);

    @Query("""
                SELECT t FROM Tour t
                WHERE (:category IS NULL OR t.category = :category)
                  AND (:type IS NULL OR t.type = :type)
                  AND (:language IS NULL OR t.language = :language)
            """)
    Page<Tour> findByFilters(@Param("category") String category,
            @Param("type") String type,
            @Param("language") String language,
            Pageable pageable);
}