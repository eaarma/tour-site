package com.example.store_manager.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "tours")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private BigDecimal price;
    private Integer timeRequired; // in minutes
    private String intensity;
    private int participants;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tour_categories", joinColumns = @JoinColumn(name = "tour_id"))
    @Enumerated(EnumType.STRING) // ✅ Store enum as text instead of number
    @Column(name = "category")
    private Set<TourCategory> categories;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tour_languages", joinColumns = @JoinColumn(name = "tour_id"))
    @Enumerated(EnumType.STRING) // ✅ Store enum as text instead of number
    @Column(name = "language")
    private Set<String> language;

    private String type;
    private String location;
    private String status;
    private String madeBy;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TourImage> images = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;
}