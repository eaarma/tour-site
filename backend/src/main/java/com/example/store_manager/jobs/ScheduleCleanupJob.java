package com.example.store_manager.jobs;

import com.example.store_manager.dto.schedule.TourScheduleResponseDto;
import com.example.store_manager.mapper.TourScheduleMapper;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.repository.TourScheduleRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ScheduleCleanupJob {

    private final TourScheduleRepository scheduleRepository;
    private final TourScheduleMapper scheduleMapper;

    /**
     * Runs every minute for testing (adjust cron for production, e.g., daily)
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void expirePastSchedules() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        System.out.println(">>> ScheduleCleanupJob triggered at " + LocalDate.now() + " " + LocalTime.now());

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

        // Optional: log expired schedules using MapStruct DTOs
        List<TourScheduleResponseDto> expiredDtos = toExpire.stream()
                .map(scheduleMapper::toDto)
                .collect(Collectors.toList());

        System.out.println("Expired schedules updated: " + expiredDtos.size());
        expiredDtos.forEach(dto -> System.out.println(dto));
    }
}