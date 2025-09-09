package com.example.store_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.store_manager.model.Tour;

public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByShopId(Long shopId);
}