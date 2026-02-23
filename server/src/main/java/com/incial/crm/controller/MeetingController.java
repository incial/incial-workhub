package com.incial.crm.controller;

import com.incial.crm.dto.MeetingDto;
import com.incial.crm.service.MeetingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/meetings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class MeetingController {

    private final MeetingService meetingService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<MeetingDto>> getAllMeetings() {
        log.info("GET /api/v1/meetings/all - Retrieving all meetings");
        try {
            List<MeetingDto> meetings = meetingService.getAllMeetings();
            log.info("GET /api/v1/meetings/all - Successfully retrieved {} meetings", meetings.size());
            return ResponseEntity.ok(meetings);
        } catch (Exception e) {
            log.error("GET /api/v1/meetings/all - Error retrieving all meetings", e);
            throw e;
        }
    }

    @GetMapping("/my-meetings")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<MeetingDto>> getMyMeetings(Authentication authentication) {
        String userEmail = authentication.getName();
        log.info("GET /api/v1/meetings/my-meetings - Retrieving meetings for user: {}", userEmail);
        try {
            List<MeetingDto> meetings = meetingService.getCurrentUserMeetings(userEmail);
            log.info("GET /api/v1/meetings/my-meetings - Successfully retrieved {} meetings for user: {}", meetings.size(), userEmail);
            return ResponseEntity.ok(meetings);
        } catch (Exception e) {
            log.error("GET /api/v1/meetings/my-meetings - Error retrieving meetings for user: {}", userEmail, e);
            throw e;
        }
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MeetingDto> createMeeting(@RequestBody MeetingDto dto) {
        log.info("POST /api/v1/meetings/create - Creating new meeting: {}", dto.getTitle());
        try {
            MeetingDto created = meetingService.createMeeting(dto);
            log.info("POST /api/v1/meetings/create - Successfully created meeting with ID: {}", created.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("POST /api/v1/meetings/create - Error creating meeting", e);
            throw e;
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MeetingDto> updateMeeting(@PathVariable Long id, @RequestBody MeetingDto dto) {
        log.info("PUT /api/v1/meetings/update/{} - Updating meeting", id);
        try {
            MeetingDto updated = meetingService.updateMeeting(id, dto);
            log.info("PUT /api/v1/meetings/update/{} - Successfully updated meeting", id);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("PUT /api/v1/meetings/update/{} - Error updating meeting", id, e);
            throw e;
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        log.info("DELETE /api/v1/meetings/delete/{} - Deleting meeting", id);
        try {
            meetingService.deleteMeeting(id);
            log.info("DELETE /api/v1/meetings/delete/{} - Successfully deleted meeting", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("DELETE /api/v1/meetings/delete/{} - Error deleting meeting", id, e);
            throw e;
        }
    }
}
