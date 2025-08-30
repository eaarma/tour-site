package com.example.store_manager.repository;

import com.example.store_manager.model.TourSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {

    List<TourSchedule> findByTourId(Long tourId);
}