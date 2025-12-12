package com.example.store_manager.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

import org.hibernate.envers.Audited;

@Entity
@Table(name = "shops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @OneToMany(mappedBy = "shop")
    private List<ShopUser> members;

}