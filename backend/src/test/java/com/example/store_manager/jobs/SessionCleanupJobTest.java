package com.example.store_manager.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.model.TourSession;
import com.example.store_manager.repository.TourSessionRepository;

@ExtendWith(MockitoExtension.class)
class SessionCleanupJobTest {

    @Mock
    private TourSessionRepository sessionRepository;

    @InjectMocks
    private SessionCleanupJob sessionCleanupJob;

    @Test
    void expirePastSessionsWithoutParticipants_marksOnlyPastZeroBookedSessionsAsExpired() {
        TourSession pastEmptySession = buildSession(
                SessionStatus.CONFIRMED,
                LocalDate.now().minusDays(1),
                LocalTime.NOON,
                0);
        TourSession futureEmptySession = buildSession(
                SessionStatus.CONFIRMED,
                LocalDate.now().plusDays(1),
                LocalTime.NOON,
                0);
        TourSession pastBookedSession = buildSession(
                SessionStatus.CONFIRMED,
                LocalDate.now().minusDays(1),
                LocalTime.NOON,
                2);

        when(sessionRepository.findByStatusIn(anyList()))
                .thenReturn(List.of(pastEmptySession, futureEmptySession, pastBookedSession));

        sessionCleanupJob.expirePastSessionsWithoutParticipants();

        assertEquals(SessionStatus.EXPIRED, pastEmptySession.getStatus());
        assertEquals(SessionStatus.CONFIRMED, futureEmptySession.getStatus());
        assertEquals(SessionStatus.CONFIRMED, pastBookedSession.getStatus());

        verify(sessionRepository).saveAll(argThat(sessions -> {
            List<TourSession> savedSessions = new ArrayList<>();
            sessions.forEach(savedSessions::add);

            return savedSessions.size() == 1 && savedSessions.contains(pastEmptySession);
        }));
    }

    private TourSession buildSession(
            SessionStatus status,
            LocalDate date,
            LocalTime time,
            Integer bookedParticipants) {
        return TourSession.builder()
                .status(status)
                .schedule(TourSchedule.builder()
                        .date(date)
                        .time(time)
                        .bookedParticipants(bookedParticipants)
                        .build())
                .build();
    }
}
