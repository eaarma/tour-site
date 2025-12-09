package com.example.store_manager.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
        LEFT JOIN t.categories c
        LEFT JOIN t.language l
        WHERE (:type IS NULL OR t.type = :type)
          AND (:language IS NULL OR l IN :language)
          AND (:categories IS NULL OR c IN :categories)
          AND (
            COALESCE(:keyword, '') = '' OR (
              LOWER(t.title) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%')) OR
              LOWER(t.description) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%')) OR
              LOWER(t.location) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%'))
            )
          )
          AND (:date IS NULL OR EXISTS (
               SELECT ts.id FROM TourSchedule ts
               WHERE ts.tour = t AND ts.date = :date
          ))
      """)
  Page<Tour> searchByFilters(
      @Param("categories") List<TourCategory> categories,
      @Param("type") String type,
      @Param("language") List<String> language,
      @Param("keyword") String keyword,
      @Param("date") String date,
      Pageable pageable);

  @Query(value = "SELECT * FROM tours WHERE status = 'ACTIVE' ORDER BY random() LIMIT :count", nativeQuery = true)
  List<Tour> findRandomActiveTours(@Param("count") int count);

  @Query(value = "SELECT * FROM tours WHERE status = 'ACTIVE' ORDER BY random() LIMIT 1", nativeQuery = true)
  Optional<Tour> findRandomActiveTour();

  @Query("""
          SELECT t.shop.id
          FROM Tour t
          WHERE t.id = :tourId
      """)
  Long findShopIdByTourId(@Param("tourId") Long tourId);

  @Query("""
          SELECT s.tour.id
          FROM TourSchedule s
          WHERE s.id = :scheduleId
      """)
  Long findTourIdByScheduleId(@Param("scheduleId") Long scheduleId);

}
