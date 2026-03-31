package com.example.store_manager.service;

import com.example.store_manager.dto.tourSession.TourSessionDetailsDto;
import com.example.store_manager.mapper.TourSessionMapper;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.model.TourSession;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.TourSessionRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.CurrentUserService;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;
import com.example.store_manager.security.annotations.ShopIdSource;
import com.example.store_manager.utility.ApiError;

import lombok.RequiredArgsConstructor;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public Result<Page<TourSessionDetailsDto>> searchSessionsForAdmin(
            String query,
            String status,
            LocalDate from,
            LocalDate to,
            int page,
            int size) {

        if (from != null && to != null && from.isAfter(to)) {
            return Result.fail(ApiError.badRequest("'From' date must be before or equal to 'To' date"));
        }

        String normalizedQuery = normalizeQuery(query);
        SessionStatus normalizedStatus = normalizeStatus(status);

        if (status != null && !status.isBlank() && normalizedStatus == null) {
            return Result.fail(ApiError.badRequest("Invalid session status"));
        }

        Pageable pageable = PageRequest.of(page, size);

        Page<TourSession> result = tourSessionRepository.findAll(
                buildAdminSessionSpecification(normalizedQuery, normalizedStatus, from, to),
                pageable);

        return Result.ok(result.map(mapper::toDto));
    }

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

        if (newStatus == SessionStatus.COMPLETED
                && isSessionInFuture(session)
                && !currentUserService.hasRole("ADMIN")) {
            return Result.fail(ApiError.badRequest("Session cannot be completed before it takes place"));
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

    private String normalizeQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }

        return query.trim();
    }

    private SessionStatus normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        try {
            return SessionStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private Specification<TourSession> buildAdminSessionSpecification(
            String query,
            SessionStatus status,
            LocalDate from,
            LocalDate to) {

        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            var scheduleJoin = root.join("schedule");
            var tourJoin = scheduleJoin.join("tour");

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (from != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(scheduleJoin.get("date"), from));
            }

            if (to != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(scheduleJoin.get("date"), to));
            }

            if (query != null) {
                String loweredQuery = "%" + query.toLowerCase(Locale.ROOT) + "%";

                Predicate idMatch = criteriaBuilder.like(
                        criteriaBuilder.function(
                                "to_char",
                                String.class,
                                root.get("id"),
                                criteriaBuilder.literal("FM999999999999999999")),
                        "%" + query + "%");

                Predicate titleMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(tourJoin.get("title")),
                        loweredQuery);

                predicates.add(criteriaBuilder.or(idMatch, titleMatch));
            }

            if (!Long.class.equals(criteriaQuery.getResultType())
                    && !long.class.equals(criteriaQuery.getResultType())) {
                criteriaQuery.orderBy(
                        criteriaBuilder.desc(scheduleJoin.get("date")),
                        criteriaBuilder.desc(scheduleJoin.get("time")),
                        criteriaBuilder.desc(root.get("id")));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private boolean isSessionInFuture(TourSession session) {
        if (session.getSchedule() == null || session.getSchedule().getDate() == null) {
            return false;
        }

        LocalTime scheduledTime = session.getSchedule().getTime() != null
                ? session.getSchedule().getTime()
                : LocalTime.MIDNIGHT;

        LocalDateTime scheduledAt = LocalDateTime.of(
                session.getSchedule().getDate(),
                scheduledTime);

        return scheduledAt.isAfter(LocalDateTime.now());
    }
}
