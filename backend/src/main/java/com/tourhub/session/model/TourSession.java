package com.tourhub.session.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.tourhub.order.model.CancelledBy;
import com.tourhub.user.model.User;
import com.tourhub.order.model.OrderItem;
import com.tourhub.tour.model.TourSchedule;

import org.hibernate.envers.Audited;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tour_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class TourSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false, unique = true)
    private TourSchedule schedule;

    @OneToMany(mappedBy = "session")
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @Enumerated(EnumType.STRING)
    private CancelledBy cancelledBy;

    private Instant cancelledAt;
}
