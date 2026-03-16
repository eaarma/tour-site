package com.example.store_manager.service;

import com.example.store_manager.dto.tourSession.TourSessionDetailsDto;
import com.example.store_manager.mapper.TourSessionMapper;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSession;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.TourSessionRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;
import com.example.store_manager.security.annotations.ShopIdSource;
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
    private final TourSessionRepository tourSessionRepository;
    private final TourSessionMapper mapper;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;

    @Transactional(readOnly = true)
    public Result<List<TourSessionDetailsDto>> getSessions(Long tourId) {
        return Result.ok(
                tourSessionRepository.findBySchedule_Tour_Id(tourId)
                        .stream()
                        .map(mapper::toDto)
                        .toList());
    }

    @Transactional(readOnly = true)
    public Result<TourSessionDetailsDto> getSession(Long sessionId) {
        return tourSessionRepository.findById(sessionId)
                .map(mapper::toDto)
                .map(Result::ok)
                .orElseGet(() -> Result.fail(ApiError.notFound("Session not found")));
    }

    @Transactional
    @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.SESSION_ID)
    public Result<TourSessionDetailsDto> assignManager(Long sessionId, UUID managerId) {

        TourSession session = tourSessionRepository.findById(sessionId)
                .orElse(null);

        if (session == null) {
            return Result.fail(ApiError.notFound("Session not found"));
        }

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

        return Result.ok(mapper.toDto(tourSessionRepository.save(session)));
    }

    @Transactional
    @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.SESSION_ID)
    public Result<TourSessionDetailsDto> updateStatus(Long sessionId, SessionStatus newStatus) {

        TourSession session = tourSessionRepository.findById(sessionId)
                .orElse(null);

        if (session == null) {
            return Result.fail(ApiError.notFound("Session not found"));
        }

        if (session.getStatus() == SessionStatus.COMPLETED) {
            return Result.fail(ApiError.badRequest("Completed sessions cannot change status"));
        }

        session.setStatus(newStatus);
        return Result.ok(mapper.toDto(tourSessionRepository.save(session)));
    }

    @Transactional(readOnly = true)
    @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.SHOP_ID)
    public Result<List<TourSessionDetailsDto>> getSessionsForShop(Long shopId) {

        List<TourSessionDetailsDto> sessions = tourSessionRepository
                .findByShopIdWithParticipants(shopId)
                .stream()
                .map(mapper::toDto)
                .toList();

        return Result.ok(sessions);
    }

    @Transactional(readOnly = true)
    public Result<List<TourSessionDetailsDto>> getSessionsForManager(UUID managerId) {

        if (!userRepository.existsById(managerId)) {
            return Result.fail(ApiError.notFound("Manager not found"));
        }

        return Result.ok(
                tourSessionRepository.findByManagerId(managerId)
                        .stream()
                        .map(mapper::toDto)
                        .toList());
    }

    @Transactional(readOnly = true)
    public long getCompletedSessionsCount(Long shopId) {
        return tourSessionRepository.countCompletedSessionsByShop(shopId);
    }

    public List<TourSessionDetailsDto> getByShopId(Long shopId) {

        List<TourSession> sessions = tourSessionRepository.findByShopIdWithParticipants(shopId);

        return sessions.stream()
                .map(mapper::toDto)
                .toList();
    }
}
