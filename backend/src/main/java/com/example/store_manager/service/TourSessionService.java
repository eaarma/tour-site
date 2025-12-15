package com.example.store_manager.service;

import com.example.store_manager.dto.tourSession.TourSessionDto;
import com.example.store_manager.mapper.TourSessionMapper;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSession;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.TourSessionRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import com.example.store_manager.model.User;
