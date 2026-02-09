package com.example.store_manager.model;

import java.time.LocalDate;
import java.time.LocalTime;

import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(name = "reserved_participants", nullable = false)
    private Integer reservedParticipants = 0;

    public int getAvailableParticipants() {
        int reserved = reservedParticipants != null ? reservedParticipants : 0;
        int booked = bookedParticipants != null ? bookedParticipants : 0;
        return maxParticipants - booked - reserved;
    }

    public void releaseReserved(int amount) {
        if (amount < 0)
            throw new IllegalArgumentException();

        reservedParticipants = Math.max(0, reservedParticipants - amount);
    }

}
