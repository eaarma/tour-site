package com.example.store_manager.service;

import com.example.store_manager.dto.tourSession.TourSessionDto;
import com.example.store_manager.mapper.TourSessionMapper;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSession;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.TourSessionRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import com.example.store_manager.model.User;

@Service
@RequiredArgsConstructor
public class TourSessionService {
    private final TourSessionRepository repo;
    private final TourSessionMapper mapper;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;

    @Transactional(readOnly = true)
    public List<TourSessionDto> getSessions(Long tourId) {
        return repo.findByTourId(tourId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TourSessionDto getSession(Long sessionId) {
        return repo.findById(sessionId)
                .map(mapper::toDto)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    @Transactional
    @ShopAccess(AccessLevel.GUIDE)
    public TourSessionDto assignManager(Long sessionId, UUID managerId) {
        TourSession session = repo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (managerId == null) {
            session.setManager(null);
        } else {
            User manager = userRepository.findById(managerId)
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            session.setManager(manager);
        }

        return mapper.toDto(repo.save(session));
    }

    @Transactional
    @ShopAccess(AccessLevel.GUIDE)

    public TourSessionDto updateStatus(Long sessionId, SessionStatus newStatus) {
        TourSession session = repo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setStatus(newStatus);

        repo.save(session);
        return mapper.toDto(session);
    }

    @Transactional(readOnly = true)
    public List<TourSessionDto> getSessionsForShop(Long shopId) {

        // 1) Find all tours that belong to this shop
        List<Tour> tours = tourRepository.findByShopId(shopId);

        if (tours.isEmpty()) {
            return Collections.emptyList();
        }

        // 2) Extract all tour IDs
        List<Long> tourIds = tours.stream()
                .map(Tour::getId)
                .collect(Collectors.toList());

        // 3) Fetch all sessions belonging to all those tours
        List<TourSession> sessions = repo.findByTourIdIn(tourIds);

        // 4) Map to DTO
        return sessions.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TourSessionDto> getSessionsForManager(UUID managerId) {
        return repo.findByManagerId(managerId).stream()
                .map(mapper::toDto)
                .toList();
    }

}
