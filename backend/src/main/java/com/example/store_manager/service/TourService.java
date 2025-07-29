package com.example.store_manager.service;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.example.store_manager.dto.tour.TourCreateDto;
import com.example.store_manager.dto.tour.TourResponseDto;
import com.example.store_manager.mapper.TourMapper;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.Tour;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.ShopRepository;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;
    private final TourMapper tourMapper;
    private final ShopRepository shopRepository;

  public TourResponseDto createTour(TourCreateDto dto) {
    Shop shop = shopRepository.findById(dto.getShopId())
        .orElseThrow(() -> new RuntimeException("Shop not found"));

    Tour tour = tourMapper.toEntity(dto);
    tour.setShop(shop);  // set shop entity explicitly

    Tour saved = tourRepository.save(tour);
    return tourMapper.toDto(saved);
}

    public TourResponseDto updateTour(Long id, TourCreateDto dto) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        tourMapper.updateTourFromDto(dto, tour);

        Tour updated = tourRepository.save(tour);
        return tourMapper.toDto(updated);
    }

    public List<TourResponseDto> getAllTours() {
        return tourRepository.findAll()
                .stream()
                .map(tourMapper::toDto)
                .collect(Collectors.toList());
    }

    public TourResponseDto getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        return tourMapper.toDto(tour);
    }
}