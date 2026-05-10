package com.tourhub.common.jobs;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.tour.model.TourSchedule;
import com.tourhub.tour.repository.TourScheduleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ScheduleCleanupJob {

    private final TourScheduleRepository scheduleRepository;

    /**
     * Runs every minute for testing (adjust cron for production, e.g., daily)
     */
    @Scheduled(fixedRate = 24 * 60 * 60 * 1000) // 24 hour interval
    @Transactional
    public void expirePastSchedules() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // Load only ACTIVE schedules
        List<TourSchedule> activeSchedules = scheduleRepository.findByStatus("ACTIVE");

        // Filter schedules that are past and mark as EXPIRED
        List<TourSchedule> toExpire = activeSchedules.stream()
                .filter(s -> {
                    LocalDate date = s.getDate();
                    LocalTime time = s.getTime() != null ? s.getTime() : LocalTime.MIN;
                    return date.isBefore(today) || (date.isEqual(today) && time.isBefore(now));
                })
                .collect(Collectors.toList());

        // Update statuses safely within the transaction
        toExpire.forEach(s -> s.setStatus("EXPIRED"));

        scheduleRepository.saveAll(toExpire);
    }
}
