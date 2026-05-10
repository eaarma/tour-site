package com.tourhub.storefront.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tourhub.storefront.model.StorePage;

@Repository
public interface StorePageRepository extends JpaRepository<StorePage, Long> {

    Optional<StorePage> findBySlug(String slug);

    List<StorePage> findAllByOrderByIdAsc();
}
