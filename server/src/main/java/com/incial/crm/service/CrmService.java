package com.incial.crm.service;

import com.incial.crm.dto.CrmEntryDto;
import com.incial.crm.entity.CrmEntry;
import com.incial.crm.repository.CrmEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CrmService {

    @Autowired
    private CrmEntryRepository crmEntryRepository;

    public Map<String, List<CrmEntryDto>> getAllEntries() {
        List<CrmEntry> entries = crmEntryRepository.findAll();
        List<CrmEntryDto> dtoList = entries.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        Map<String, List<CrmEntryDto>> response = new HashMap<>();
        response.put("crmList", dtoList);
        return response;
    }

    public CrmEntryDto createEntry(CrmEntryDto dto) {
        CrmEntry entry = convertToEntity(dto);
        CrmEntry saved = crmEntryRepository.save(entry);
        return convertToDto(saved);
    }

    public CrmEntryDto updateEntry(Long id, CrmEntryDto dto) {
        CrmEntry entry = crmEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CRM Entry not found with id: " + id));
        
        updateEntityFromDto(entry, dto);
        CrmEntry updated = crmEntryRepository.save(entry);
        return convertToDto(updated);
    }

    public void deleteEntry(Long id) {
        if (!crmEntryRepository.existsById(id)) {
            throw new RuntimeException("CRM Entry not found with id: " + id);
        }
        crmEntryRepository.deleteById(id);
    }

    public CrmEntryDto getCrmDetails(Long id) {
        CrmEntry entry = crmEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CRM Entry not found with id: " + id));
        return convertToDto(entry);
    }

    private CrmEntryDto convertToDto(CrmEntry entity) {
        return CrmEntryDto.builder()
                .id(entity.getId())
                .company(entity.getCompany())
                .contactName(entity.getContactName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .companyImageUrl(entity.getCompanyImageUrl())
                .status(entity.getStatus())
                .dealValue(entity.getDealValue())
                .assignedTo(entity.getAssignedTo())
                .nextFollowUp(entity.getNextFollowUp())
                .lastContact(entity.getLastContact())
                .referenceId(entity.getReferenceId())
                .notes(entity.getNotes())
                .tags(entity.getTags())
                .work(entity.getWork())
                .leadSources(entity.getLeadSources())
                .driveLink(entity.getDriveLink())
                .socials(entity.getSocials())
                .lastUpdatedBy(entity.getLastUpdatedBy())
                .lastUpdatedAt(entity.getLastUpdatedAt())
                .build();
    }

    private CrmEntry convertToEntity(CrmEntryDto dto) {
        return CrmEntry.builder()
                .company(dto.getCompany())
                .contactName(dto.getContactName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .companyImageUrl(dto.getCompanyImageUrl())
                .status(dto.getStatus())
                .dealValue(dto.getDealValue())
                .assignedTo(dto.getAssignedTo())
                .nextFollowUp(dto.getNextFollowUp())
                .lastContact(dto.getLastContact())
                .referenceId(dto.getReferenceId())
                .notes(dto.getNotes())
                .tags(dto.getTags())
                .work(dto.getWork())
                .leadSources(dto.getLeadSources())
                .driveLink(dto.getDriveLink())
                .socials(dto.getSocials())
                .lastUpdatedBy(dto.getLastUpdatedBy())
                .build();
    }

    private void updateEntityFromDto(CrmEntry entity, CrmEntryDto dto) {
        String user = UserService.getCurrentUsername();

        if (dto.getCompany() != null) entity.setCompany(dto.getCompany());
        if (dto.getContactName() != null) entity.setContactName(dto.getContactName());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getPhone() != null) entity.setPhone(dto.getPhone());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
        if (dto.getCompanyImageUrl() != null) entity.setCompanyImageUrl(dto.getCompanyImageUrl());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getDealValue() != null) entity.setDealValue(dto.getDealValue());
        if (dto.getAssignedTo() != null) entity.setAssignedTo(dto.getAssignedTo());
        if (dto.getNextFollowUp() != null) entity.setNextFollowUp(dto.getNextFollowUp());
        if (dto.getLastContact() != null) entity.setLastContact(dto.getLastContact());
        if (dto.getReferenceId() != null) entity.setReferenceId(dto.getReferenceId());
        if (dto.getNotes() != null) entity.setNotes(dto.getNotes());
        if (dto.getTags() != null) entity.setTags(dto.getTags());
        if (dto.getWork() != null) entity.setWork(dto.getWork());
        if (dto.getLeadSources() != null) entity.setLeadSources(dto.getLeadSources());
        if (dto.getDriveLink() != null) entity.setDriveLink(dto.getDriveLink());
        if (dto.getSocials() != null) entity.setSocials(dto.getSocials());
        if (dto.getLastUpdatedBy() != null) entity.setLastUpdatedBy(user);
    }
}
