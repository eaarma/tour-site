package com.example.store_manager.repository;

import com.example.store_manager.model.ShopUser;
import com.example.store_manager.model.ShopUserStatus;
import com.example.store_manager.model.TourImage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TourImageRepository extends JpaRepository<TourImage, Long> {
    List<TourImage> findByTourIdOrderByPositionAsc(Long tourId);

    @Query("""
                SELECT t.shop.id FROM TourImage i
                JOIN i.tour t
                WHERE i.id = :imageId
            """)
    Long findShopIdByImageId(@Param("imageId") Long imageId);

}