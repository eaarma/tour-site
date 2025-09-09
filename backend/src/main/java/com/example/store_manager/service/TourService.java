package com.example.store_manager.service;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.store_manager.dto.tour.TourCreateDto;
import com.example.store_manager.dto.tour.TourResponseDto;
import com.example.store_manager.mapper.TourMapper;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.Tour;
import com.example.store_manager.repository.ShopRepository;
import com.example.store_manager.repository.TourRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;
    private final TourMapper tourMapper;
    private final ShopRepository shopRepository;

    public TourResponseDto createTour(TourCreateDto dto, Principal principal) {
        Shop shop = shopRepository.findById(dto.getShopId())
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        Tour tour = tourMapper.toEntity(dto);
        tour.setShop(shop);

        // Set madeBy from authenticated user
        tour.setMadeBy(principal.getName()); // or use user id if you prefer

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

    public List<TourResponseDto> getToursByShopId(Long shopId) {
        return tourRepository.findByShopId(shopId)
                .stream()
                .map(tourMapper::toDto)
                .collect(Collectors.toList());
    }
}