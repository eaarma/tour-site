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
import com.example.store_manager.utility.ApiError;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import com.example.store_manager.model.User;
import com.example.store_manager.utility.Result;

@Service
@RequiredArgsConstructor
public class TourSessionService {
    private final TourSessionRepository repo;
    private final TourSessionMapper mapper;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;

    @Transactional(readOnly = true)
    public Result<List<TourSessionDto>> getSessions(Long tourId) {
        List<TourSessionDto> sessions = repo.findByTourId(tourId).stream()
                .map(mapper::toDto)
                .toList();

        return Result.ok(sessions);
    }

    @Transactional(readOnly = true)
    public Result<TourSessionDto> getSession(Long sessionId) {
        return repo.findById(sessionId)
                .map(mapper::toDto)
                .map(Result::ok)
                .orElseGet(() -> Result.fail(ApiError.notFound("Session not found")));
    }

    @Transactional
    @ShopAccess(AccessLevel.GUIDE)
    public Result<TourSessionDto> assignManager(Long sessionId, UUID managerId) {

        // 1️⃣ Load session
        TourSession session = repo.findById(sessionId)
                .orElse(null);

        if (session == null) {
            return Result.fail(ApiError.notFound("Session not found"));
        }

        // 2️⃣ Handle manager assignment
        if (managerId == null) {
            session.setManager(null);
        } else {
            User manager = userRepository.findById(managerId)
                    .orElse(null);

            if (manager == null) {
                return Result.fail(ApiError.notFound("Manager not found"));
            }

            session.setManager(manager);
        }

        // 3️⃣ Save + map
        TourSession saved = repo.save(session);
        return Result.ok(mapper.toDto(saved));
    }

    @Transactional
    @ShopAccess(AccessLevel.GUIDE)
    public Result<TourSessionDto> updateStatus(Long sessionId, SessionStatus newStatus) {

        TourSession session = repo.findById(sessionId)
                .orElse(null);

        if (session == null) {
            return Result.fail(ApiError.notFound("Session not found"));
        }

        // (Optional but recommended) Prevent invalid transitions
        if (session.getStatus() == SessionStatus.COMPLETED) {
            return Result.fail(
                    ApiError.badRequest("Completed sessions cannot change status"));
        }

        session.setStatus(newStatus);
        repo.save(session);

        return Result.ok(mapper.toDto(session));
    }

    @Transactional(readOnly = true)
    public Result<List<TourSessionDto>> getSessionsForShop(Long shopId) {

        // 1️⃣ Find all tours for the shop
        List<Tour> tours = tourRepository.findByShopId(shopId);

        if (tours.isEmpty()) {
            return Result.ok(Collections.emptyList());
        }

        // 2️⃣ Extract tour IDs
        List<Long> tourIds = tours.stream()
                .map(Tour::getId)
                .toList();

        // 3️⃣ Fetch sessions for all tours
        List<TourSessionDto> sessions = repo.findByTourIdIn(tourIds).stream()
                .map(mapper::toDto)
                .toList();

        // 4️⃣ Always OK (empty list is fine)
        return Result.ok(sessions);
    }

    @Transactional(readOnly = true)
    public Result<List<TourSessionDto>> getSessionsForManager(UUID managerId) {

        if (!userRepository.existsById(managerId)) {
            return Result.fail(ApiError.notFound("Manager not found"));
        }

        List<TourSessionDto> sessions = repo.findByManagerId(managerId).stream()
                .map(mapper::toDto)
                .toList();

        return Result.ok(sessions);
    }

}
