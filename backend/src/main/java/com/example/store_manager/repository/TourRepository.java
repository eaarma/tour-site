package com.example.store_manager.repository;

import java.util.List;
import java.util.Optional;

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

        // Fetch random active tours with limit
        @Query(value = "SELECT * FROM tours WHERE status = 'ACTIVE' ORDER BY random() LIMIT :count", nativeQuery = true)
        List<Tour> findRandomActiveTours(@Param("count") int count);

        // Fetch one random active tour
        @Query(value = "SELECT * FROM tours WHERE status = 'ACTIVE' ORDER BY random() LIMIT 1", nativeQuery = true)
        Optional<Tour> findRandomActiveTour();

}