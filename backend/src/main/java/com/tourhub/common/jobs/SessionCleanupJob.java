package com.tourhub.common.jobs;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.session.model.SessionStatus;
import com.tourhub.tour.model.TourSchedule;
import com.tourhub.session.model.TourSession;
import com.tourhub.session.repository.TourSessionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionCleanupJob {

    private static final List<SessionStatus> EXPIRABLE_STATUSES = List.copyOf(EnumSet.of(
            SessionStatus.PENDING,
            SessionStatus.PLANNED,
            SessionStatus.PAID,
            SessionStatus.PARTIALLY_PAID,
            SessionStatus.CONFIRMED,
            SessionStatus.PARTIALLY_CANCELLED,
            SessionStatus.REFUNDED,
            SessionStatus.PARTIALLY_REFUNDED));

    private final TourSessionRepository sessionRepository;

    @Scheduled(fixedRate = 24 * 60 * 60 * 1000)
    @Transactional
    public void expirePastSessionsWithoutParticipants() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<TourSession> sessions = sessionRepository.findByStatusIn(EXPIRABLE_STATUSES);

        List<TourSession> toExpire = sessions.stream()
                .filter(session -> shouldExpire(session, today, now))
                .toList();

        toExpire.forEach(session -> session.setStatus(SessionStatus.EXPIRED));

        sessionRepository.saveAll(toExpire);

        log.info("Expired {} past sessions without booked participants", toExpire.size());
    }

    private boolean shouldExpire(TourSession session, LocalDate today, LocalTime now) {
        TourSchedule schedule = session.getSchedule();
        if (schedule == null || schedule.getDate() == null) {
            return false;
        }

        int bookedParticipants = schedule.getBookedParticipants() != null
                ? schedule.getBookedParticipants()
                : 0;

        if (bookedParticipants > 0) {
            return false;
        }

        LocalTime scheduledTime = schedule.getTime() != null
                ? schedule.getTime()
                : LocalTime.MIN;

        return schedule.getDate().isBefore(today)
                || (schedule.getDate().isEqual(today) && scheduledTime.isBefore(now));
    }
}
