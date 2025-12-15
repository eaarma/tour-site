package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.store_manager.dto.tourSession.TourSessionDto;
import com.example.store_manager.mapper.TourSessionMapper;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSession;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.TourSessionRepository;
import com.example.store_manager.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class TourSessionServiceTest {

    @Mock
    private TourSessionRepository repo;

    @Mock
    private TourSessionMapper mapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TourRepository tourRepository;

    @InjectMocks
    private TourSessionService service;

    @Test
    void getSession_returnsDto_whenSessionExists() {
        TourSession session = new TourSession();
        session.setId(1L);

        TourSessionDto dto = new TourSessionDto();

        when(repo.findById(1L)).thenReturn(Optional.of(session));
        when(mapper.toDto(session)).thenReturn(dto);

        TourSessionDto result = service.getSession(1L);

        assertNotNull(result);
        verify(repo).findById(1L);
        verify(mapper).toDto(session);

    }

    @Test
    void getSession_throws_whenSessionNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.getSession(99L));
    }

    @Test
    void assignManager_assignsManager_whenValid() {
        UUID managerId = UUID.randomUUID();

        TourSession session = new TourSession();
        User manager = new User();

        when(repo.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
        when(repo.save(session)).thenReturn(session);
        when(mapper.toDto(session)).thenReturn(new TourSessionDto());

        service.assignManager(1L, managerId);

        assertEquals(manager, session.getManager());
        verify(repo).save(session);
    }

    @Test
    void assignManager_clearsManager_whenManagerIdIsNull() {
        TourSession session = new TourSession();
        session.setManager(new User());

        when(repo.findById(1L)).thenReturn(Optional.of(session));
        when(repo.save(session)).thenReturn(session);
        when(mapper.toDto(session)).thenReturn(new TourSessionDto());

        service.assignManager(1L, null);

        assertNull(session.getManager());
    }

    @Test
    void getSessionsForShop_returnsEmpty_whenNoTours() {
        when(tourRepository.findByShopId(1L)).thenReturn(List.of());

        List<TourSessionDto> result = service.getSessionsForShop(1L);

        assertTrue(result.isEmpty());
        verify(repo, never()).findByTourIdIn(any());
    }

    @Test
    void getSessionsForShop_returnsSessionsForAllTours() {
        Tour tour1 = new Tour();
        tour1.setId(1L);

        Tour tour2 = new Tour();
        tour2.setId(2L);

        TourSession session = new TourSession();

        when(tourRepository.findByShopId(1L)).thenReturn(List.of(tour1, tour2));
        when(repo.findByTourIdIn(List.of(1L, 2L))).thenReturn(List.of(session));
        when(mapper.toDto(session)).thenReturn(new TourSessionDto());

        List<TourSessionDto> result = service.getSessionsForShop(1L);

        assertEquals(1, result.size());
    }

}