package com.incial.crm.service;

import com.incial.crm.dto.CompanyDto;
import com.incial.crm.entity.Company;
import com.incial.crm.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    public List<CompanyDto> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CompanyDto createCompany(CompanyDto dto) {
        Company company = convertToEntity(dto);
        Company saved = companyRepository.save(company);
        return convertToDto(saved);
    }

    public CompanyDto updateCompany(Long id, CompanyDto dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));

        updateEntityFromDto(company, dto);
        Company updated = companyRepository.save(company);
        return convertToDto(updated);
    }

    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new RuntimeException("Company not found with id: " + id);
        }
        companyRepository.deleteById(id);
    }

    private CompanyDto convertToDto(Company entity) {
        return CompanyDto.builder()
                .id(entity.getId())
                .referenceId(entity.getReferenceId())
                .name(entity.getName())
                .contactPerson(entity.getContactPerson())
                .status(entity.getStatus())
                .work(entity.getWork())
                .driveLink(entity.getDriveLink())
                .socials(entity.getSocials())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .lastUpdatedBy(entity.getLastUpdatedBy())
                .build();
    }

    private Company convertToEntity(CompanyDto dto) {
        return Company.builder()
                .referenceId(dto.getReferenceId())
                .name(dto.getName())
                .contactPerson(dto.getContactPerson())
                .status(dto.getStatus())
                .work(dto.getWork())
                .driveLink(dto.getDriveLink())
                .socials(dto.getSocials())
                .lastUpdatedBy(dto.getLastUpdatedBy())
                .build();
    }

    private void updateEntityFromDto(Company entity, CompanyDto dto) {
        if (dto.getReferenceId() != null) entity.setReferenceId(dto.getReferenceId());
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getContactPerson() != null) entity.setContactPerson(dto.getContactPerson());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getWork() != null) entity.setWork(dto.getWork());
        if (dto.getDriveLink() != null) entity.setDriveLink(dto.getDriveLink());
        if (dto.getSocials() != null) entity.setSocials(dto.getSocials());
        if (dto.getLastUpdatedBy() != null) entity.setLastUpdatedBy(dto.getLastUpdatedBy());
    }
}
