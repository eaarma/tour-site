package com.example.store_manager.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

import org.hibernate.envers.Audited;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
@Entity
@Table(name = "stripe_events", uniqueConstraints = @UniqueConstraint(columnNames = "stripeEventId"))
public class StripeEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String stripeEventId;

    @Column(nullable = false)
    private String eventType;

    private Long paymentId;

    @Column(nullable = false)
    private Instant processedAt;

}
