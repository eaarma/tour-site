package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.store_manager.dto.tourSession.TourSessionDetailsDto;
import com.example.store_manager.mapper.TourSessionMapper;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSession;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.TourSessionRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.utility.Result;

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
    void getSession_returnsOk_whenSessionExists() {
        TourSession session = new TourSession();
        session.setId(1L);

        TourSessionDetailsDto dto = new TourSessionDetailsDto();

        when(repo.findById(1L)).thenReturn(Optional.of(session));
        when(mapper.toDto(session)).thenReturn(dto);

        Result<TourSessionDetailsDto> result = service.getSession(1L);

        assertTrue(result.isOk());
        assertNotNull(result.get());
        verify(repo).findById(1L);
        verify(mapper).toDto(session);
    }

    @Test
    void assignManager_returnsFail_whenSessionNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        Result<TourSessionDetailsDto> result = service.assignManager(99L, UUID.randomUUID());

        assertTrue(result.isFail());
        assertEquals("Session not found", result.error().message());
    }

    @Test
    void assignManager_assignsManager_whenValid() {
        UUID managerId = UUID.randomUUID();

        TourSession session = new TourSession();
        User manager = new User();

        when(repo.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
        when(repo.save(session)).thenReturn(session);
        when(mapper.toDto(session)).thenReturn(new TourSessionDetailsDto());

        Result<TourSessionDetailsDto> result = service.assignManager(1L, managerId);

        assertTrue(result.isOk());
        assertEquals(manager, session.getManager());
    }

    @Test
    void assignManager_clearsManager_whenManagerIdIsNull() {
        TourSession session = new TourSession();
        session.setManager(new User());

        when(repo.findById(1L)).thenReturn(Optional.of(session));
        when(repo.save(session)).thenReturn(session);
        when(mapper.toDto(session)).thenReturn(new TourSessionDetailsDto());

        service.assignManager(1L, null);

        assertNull(session.getManager());
    }

    @Test
    void getSessionsForShop_returnsEmptyOkResult_whenNoTours() {

        when(tourRepository.findByShopId(1L)).thenReturn(List.of());

        Result<List<TourSessionDetailsDto>> result = service.getSessionsForShop(1L);

        assertTrue(result.isOk());
        assertNotNull(result.get());
        assertTrue(result.get().isEmpty());

        verify(repo, never()).findBySchedule_Tour_IdIn(any());
        verify(mapper, never()).toDto(any());
    }

    @Test
    void getSessionsForShop_returnsSessionsForAllTours() {

        Tour tour1 = new Tour();
        tour1.setId(1L);

        Tour tour2 = new Tour();
        tour2.setId(2L);

        TourSession session = new TourSession();
        TourSessionDetailsDto dto = new TourSessionDetailsDto();

        when(tourRepository.findByShopId(1L))
                .thenReturn(List.of(tour1, tour2));

        when(repo.findBySchedule_Tour_IdIn(List.of(1L, 2L)))
                .thenReturn(List.of(session));

        when(mapper.toDto(session))
                .thenReturn(dto);

        Result<List<TourSessionDetailsDto>> result = service.getSessionsForShop(1L);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));

        verify(repo).findBySchedule_Tour_IdIn(List.of(1L, 2L));
        verify(mapper).toDto(session);
    }

    @Test
    void updateStatus_updatesSessionStatus() {
        TourSession session = new TourSession();
        session.setStatus(SessionStatus.PLANNED);

        when(repo.findById(1L)).thenReturn(Optional.of(session));
        when(repo.save(session)).thenReturn(session);
        when(mapper.toDto(session)).thenReturn(new TourSessionDetailsDto());

        service.updateStatus(1L, SessionStatus.COMPLETED);

        Result<TourSessionDetailsDto> result = service.updateStatus(99L, SessionStatus.CONFIRMED);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }

    @Test
    void getSessions_returnsEmptyOkResult_whenNoSessionsExist() {

        when(repo.findBySchedule_Tour_Id(1L))
                .thenReturn(List.of());

        Result<List<TourSessionDetailsDto>> result = service.getSessions(1L);

        assertTrue(result.isOk());
        assertTrue(result.get().isEmpty());
        verify(mapper, never()).toDto(any());
    }

    @Test
    void getSessions_returnsMappedSessions_whenSessionsExist() {

        TourSession session = new TourSession();
        TourSessionDetailsDto dto = new TourSessionDetailsDto();

        when(repo.findBySchedule_Tour_Id(1L))
                .thenReturn(List.of(session));

        when(mapper.toDto(session))
                .thenReturn(dto);

        Result<List<TourSessionDetailsDto>> result = service.getSessions(1L);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));

        verify(mapper).toDto(session);
    }

    @Test
    void getSessionsForManager_returnsSessions_whenManagerExists() {
        UUID managerId = UUID.randomUUID();

        TourSession session = new TourSession();
        TourSessionDetailsDto dto = new TourSessionDetailsDto();

        when(userRepository.existsById(managerId)).thenReturn(true);
        when(repo.findByManagerId(managerId)).thenReturn(List.of(session));
        when(mapper.toDto(session)).thenReturn(dto);

        Result<List<TourSessionDetailsDto>> result = service.getSessionsForManager(managerId);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
    }

    @Test
    void getSessionsForManager_returnsFail_whenManagerNotFound() {
        UUID managerId = UUID.randomUUID();

        when(userRepository.existsById(managerId)).thenReturn(false);

        Result<List<TourSessionDetailsDto>> result = service.getSessionsForManager(managerId);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }

    @Test
    void updateStatus_updatesSessionStatus_whenValid() {
        TourSession session = new TourSession();
        session.setStatus(SessionStatus.CONFIRMED);

        when(repo.findById(1L)).thenReturn(Optional.of(session));
        when(repo.save(session)).thenReturn(session); // ✅ REQUIRED
        when(mapper.toDto(session)).thenReturn(new TourSessionDetailsDto());

        Result<TourSessionDetailsDto> result = service.updateStatus(1L, SessionStatus.COMPLETED);

        assertTrue(result.isOk());
        assertEquals(SessionStatus.COMPLETED, session.getStatus());
        verify(repo).save(session);
    }

    @Test
    void updateStatus_returnsFail_whenSessionNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        Result<TourSessionDetailsDto> result = service.updateStatus(99L, SessionStatus.CONFIRMED);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }

    @Test
    void updateStatus_returnsFail_whenSessionAlreadyCompleted() {
        TourSession session = new TourSession();
        session.setStatus(SessionStatus.COMPLETED);

        when(repo.findById(1L)).thenReturn(Optional.of(session));

        Result<TourSessionDetailsDto> result = service.updateStatus(1L, SessionStatus.CONFIRMED);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());

        verify(repo, never()).save(any());
    }

}