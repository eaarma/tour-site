package com.example.store_manager.repository;

import com.example.store_manager.model.TourImage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TourImageRepository extends JpaRepository<TourImage, Long> {
    List<TourImage> findByTourIdOrderByPositionAsc(Long tourId);
}