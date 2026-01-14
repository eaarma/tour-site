package com.example.store_manager.model;

import java.time.LocalDate;
import java.time.LocalTime;

import org.hibernate.envers.Audited;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tour_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Audited
public class TourSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(nullable = false)
    private LocalDate date;

    @Column
    private LocalTime time;

    @Column(nullable = false)
    private int maxParticipants;

    @Column(nullable = false)
    private Integer bookedParticipants = 0;

    @Column(nullable = false)
    private String status; // ACTIVE, EXPIRED, BOOKED
}
