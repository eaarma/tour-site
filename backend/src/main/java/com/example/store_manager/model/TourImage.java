package com.example.store_manager.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Data
@Entity
@Table(name = "tour_images")
@Audited
@EntityListeners(AuditingEntityListener.class)
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

    @CreatedDate
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;
}