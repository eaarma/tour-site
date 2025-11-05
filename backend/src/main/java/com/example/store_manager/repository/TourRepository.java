package com.example.store_manager.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourCategory;

public interface TourRepository extends JpaRepository<Tour, Long> {

        List<Tour> findByShopId(Long shopId);

        @Query("""
                            SELECT DISTINCT t FROM Tour t
                            JOIN t.categories c
                            WHERE (:type IS NULL OR t.type = :type)
                              AND (:language IS NULL OR t.language = :language)
                              AND (:categories IS NULL OR c IN :categories)
                        """)
        Page<Tour> findByFilters(
                        @Param("categories") List<TourCategory> categories,
                        @Param("type") String type,
                        @Param("language") String language,
                        Pageable pageable);

        @Query(value = "SELECT * FROM tours WHERE status = 'ACTIVE' ORDER BY random() LIMIT :count", nativeQuery = true)
        List<Tour> findRandomActiveTours(@Param("count") int count);

        @Query(value = "SELECT * FROM tours WHERE status = 'ACTIVE' ORDER BY random() LIMIT 1", nativeQuery = true)
        Optional<Tour> findRandomActiveTour();
}
