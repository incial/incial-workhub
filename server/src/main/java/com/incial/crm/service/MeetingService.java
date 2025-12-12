package com.incial.crm.service;

import com.incial.crm.dto.MeetingDto;
import com.incial.crm.entity.Meeting;
import com.incial.crm.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    @Autowired
    private MeetingRepository meetingRepository;

    public List<MeetingDto> getAllMeetings() {
        return meetingRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public MeetingDto createMeeting(MeetingDto dto) {
        Meeting meeting = convertToEntity(dto);
        Meeting saved = meetingRepository.save(meeting);
        return convertToDto(saved);
    }

    public MeetingDto updateMeeting(Long id, MeetingDto dto) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found with id: " + id));
        
        updateEntityFromDto(meeting, dto);
        Meeting updated = meetingRepository.save(meeting);
        return convertToDto(updated);
    }

    public void deleteMeeting(Long id) {
        if (!meetingRepository.existsById(id)) {
            throw new RuntimeException("Meeting not found with id: " + id);
        }
        meetingRepository.deleteById(id);
    }

    private MeetingDto convertToDto(Meeting entity) {
        return MeetingDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .dateTime(entity.getDateTime())
                .status(entity.getStatus())
                .meetingLink(entity.getMeetingLink())
                .notes(entity.getNotes())
                .crmEntryId(entity.getCrmEntryId())
                .assignedTo(entity.getAssignedTo())
                .createdAt(entity.getCreatedAt())
                .lastUpdatedBy(entity.getLastUpdatedBy())
                .lastUpdatedAt(entity.getLastUpdatedAt())
                .build();
    }

    private Meeting convertToEntity(MeetingDto dto) {
        return Meeting.builder()
                .title(dto.getTitle())
                .dateTime(dto.getDateTime())
                .status(dto.getStatus())
                .meetingLink(dto.getMeetingLink())
                .notes(dto.getNotes())
                .crmEntryId(dto.getCrmEntryId())
                .assignedTo(dto.getAssignedTo())
                .build();
    }

    private void updateEntityFromDto(Meeting entity, MeetingDto dto) {
        String user = UserService.getCurrentUsername();
        
        if (dto.getTitle() != null) entity.setTitle(dto.getTitle());
        if (dto.getDateTime() != null) entity.setDateTime(dto.getDateTime());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getMeetingLink() != null) entity.setMeetingLink(dto.getMeetingLink());
        if (dto.getNotes() != null) entity.setNotes(dto.getNotes());
        if (dto.getCrmEntryId() != null) entity.setCrmEntryId(dto.getCrmEntryId());
        if (dto.getAssignedTo() != null) entity.setAssignedTo(dto.getAssignedTo());
        entity.setLastUpdatedBy(user);
    }
}
