package com.example.store_manager.repository;

import java.time.LocalDate;
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
import org.springframework.stereotype.Repository;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {

  List<Tour> findByShopId(Long shopId);

  @Query("""
          SELECT DISTINCT t FROM Tour t
          LEFT JOIN t.language l
          WHERE (:type IS NULL OR t.type IN :type)
            AND (:language IS NULL OR l IN :language)
            AND t.status = 'ACTIVE'
            AND (
              COALESCE(:keyword, '') = '' OR (
                LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(t.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            )
      """)
  Page<Tour> searchBase(
      @Param("type") List<String> type,
      @Param("language") List<String> language,
      @Param("keyword") String keyword,
      Pageable pageable);

  @Query("""
          SELECT DISTINCT t FROM Tour t
          LEFT JOIN t.categories c
          LEFT JOIN t.language l
          WHERE (:type IS NULL OR t.type IN :type)
            AND (:language IS NULL OR l IN :language)
            AND (:categories IS NULL OR c IN :categories)
            AND t.status = 'ACTIVE'
            AND (
              COALESCE(:keyword, '') = '' OR (
                LOWER(t.title) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%')) OR
                LOWER(t.description) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%')) OR
                LOWER(t.location) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%'))
              )
            )
      """)
  Page<Tour> searchByFiltersWithoutDate(
      @Param("categories") List<TourCategory> categories,
      @Param("type") List<String> type,
      @Param("language") List<String> language,
      @Param("keyword") String keyword,
      Pageable pageable);

  @Query("""
          SELECT DISTINCT t FROM Tour t
          LEFT JOIN t.language l
          WHERE EXISTS (
              SELECT 1 FROM TourSchedule ts
              WHERE ts.tour = t
                AND ts.date = :date
          )
            AND (:type IS NULL OR t.type IN :type)
            AND (:language IS NULL OR l IN :language)
            AND t.status = 'ACTIVE'
            AND (
              COALESCE(:keyword, '') = '' OR (
                LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(t.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            )
      """)
  Page<Tour> searchWithDate(
      @Param("type") List<String> type,
      @Param("language") List<String> language,
      @Param("keyword") String keyword,
      @Param("date") LocalDate date,
      Pageable pageable);

  @Query("""
          SELECT DISTINCT t FROM Tour t
          LEFT JOIN t.language l
          WHERE (:type IS NULL OR t.type IN :type)
            AND (:language IS NULL OR l IN :language)
            AND t.status = 'ACTIVE'
            AND (
              COALESCE(:keyword, '') = '' OR (
                LOWER(t.title) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%')) OR
                LOWER(t.description) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%')) OR
                LOWER(t.location) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%'))
              )
            )
      """)
  Page<Tour> searchWithoutCategory(
      @Param("type") List<String> type,
      @Param("language") List<String> language,
      @Param("keyword") String keyword,
      Pageable pageable);

  @Query("""
          SELECT DISTINCT t FROM Tour t
          LEFT JOIN t.language l
          WHERE EXISTS (
              SELECT 1 FROM t.categories c
              WHERE c IN :categories
          )
            AND (:type IS NULL OR t.type IN :type)
            AND (:language IS NULL OR l IN :language)
            AND t.status = 'ACTIVE'
            AND (
              COALESCE(:keyword, '') = '' OR (
                LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(t.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            )
      """)
  Page<Tour> searchWithCategory(
      @Param("categories") List<TourCategory> categories,
      @Param("type") List<String> type,
      @Param("language") List<String> language,
      @Param("keyword") String keyword,
      Pageable pageable);

  @Query("""
          SELECT DISTINCT t FROM Tour t
          LEFT JOIN t.language l
          WHERE EXISTS (
              SELECT 1 FROM t.categories c
              WHERE c IN :categories
          )
            AND EXISTS (
              SELECT 1 FROM TourSchedule ts
              WHERE ts.tour = t
                AND ts.date = :date
            )
            AND (:type IS NULL OR t.type IN :type)
            AND (:language IS NULL OR l IN :language)
            AND t.status = 'ACTIVE'
            AND (
              COALESCE(:keyword, '') = '' OR (
                LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(t.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            )
      """)
  Page<Tour> searchWithCategoryAndDate(
      @Param("categories") List<TourCategory> categories,
      @Param("type") List<String> type,
      @Param("language") List<String> language,
      @Param("keyword") String keyword,
      @Param("date") LocalDate date,
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

  @Query("""
          select sch.tour.shop.id
          from TourSession s
          join s.schedule sch
          where s.id = :sessionId
      """)
  Long findShopIdBySessionId(@Param("sessionId") Long sessionId);

  @Query("""
          SELECT t.shop.id
          FROM TourSchedule s
          JOIN s.tour t
          WHERE s.id = :scheduleId
      """)
  Long findShopIdByScheduleId(@Param("scheduleId") Long scheduleId);
}
