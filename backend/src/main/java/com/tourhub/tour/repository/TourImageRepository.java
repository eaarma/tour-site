package com.tourhub.tour.repository;

import com.tourhub.tour.model.TourImage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TourImageRepository extends JpaRepository<TourImage, Long> {

    /*
     * -----------------------------
     * Basic lookup
     * -----------------------------
     */

    List<TourImage> findByTourIdOrderByPositionAsc(Long tourId);

    /*
     * -----------------------------
     * Authorization helper
     * -----------------------------
     */

    @Query("""
                SELECT t.shop.id
                FROM TourImage i
                JOIN i.tour t
                WHERE i.id = :imageId
            """)
    Optional<Long> findShopIdByImageId(@Param("imageId") Long imageId);
}
