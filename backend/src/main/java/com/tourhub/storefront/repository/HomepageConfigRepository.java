package com.tourhub.storefront.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tourhub.storefront.model.HomepageConfig;

@Repository
public interface HomepageConfigRepository extends JpaRepository<HomepageConfig, Long> {

    Optional<HomepageConfig> findTopByOrderByIdAsc();
}
