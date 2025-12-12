package com.example.store_manager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import org.hibernate.envers.Audited;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Data
@Entity
@Table(name = "tour_images")
@Audited
public class TourImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id")
    @JsonBackReference // ✅ Prevents infinite Tour → Image → Tour loop
    private Tour tour;

    private String imageUrl;

    private Integer position; // optional ordering

    private LocalDateTime uploadedAt = LocalDateTime.now();
}