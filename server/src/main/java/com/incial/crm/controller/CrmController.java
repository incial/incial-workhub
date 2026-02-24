package com.incial.crm.controller;

import com.incial.crm.dto.CrmEntryDto;
import com.incial.crm.service.CrmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/crm")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CrmController {

    private final CrmService crmService;

    @GetMapping("/all")
    @PreAuthorize(
            "hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPER_ADMIN') or hasAuthority('ROLE_EMPLOYEE')"
    )
    public ResponseEntity<Map<String, List<CrmEntryDto>>> getAllEntries() {
        return ResponseEntity.ok(crmService.getAllEntries());
    }

    @GetMapping("/onboarded")
    @PreAuthorize(
            "hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPER_ADMIN') or hasAuthority('ROLE_EMPLOYEE')"
    )
    public ResponseEntity<List<CrmEntryDto>> getOnboardedEntries() {
        return ResponseEntity.ok(crmService.getOnboardedEntries());
    }

    @GetMapping("/done")
    @PreAuthorize(
            "hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPER_ADMIN') or hasAuthority('ROLE_EMPLOYEE')"
    )
    public ResponseEntity<List<CrmEntryDto>> getCompletedEntries() {
        return ResponseEntity.ok(crmService.getCompletedEntries());
    }

    @GetMapping("/closed")
    @PreAuthorize(
            "hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPER_ADMIN') or hasAuthority('ROLE_EMPLOYEE')"
    )
    public ResponseEntity<List<CrmEntryDto>> getDroppedEntries() {
        return ResponseEntity.ok(crmService.getDroppedEntries());
    }

    @GetMapping("/details/{id}")
    @PreAuthorize(
            "hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPER_ADMIN') or hasAuthority('ROLE_EMPLOYEE')"
    )
    public ResponseEntity<CrmEntryDto> getCrmDetails(@PathVariable Long id) {
        CrmEntryDto details = crmService.getCrmDetails(id);
        return ResponseEntity.ok(details);
    }

    @GetMapping("/my-crm")
    @PreAuthorize("hasAuthority('ROLE_CLIENT')")
    public ResponseEntity<CrmEntryDto> getClientCrmDetails(Authentication authentication) {
        String userEmail = authentication.getName();
        CrmEntryDto details = crmService.getClientCrmDetails(userEmail);
        return ResponseEntity.ok(details);
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<CrmEntryDto> createEntry(@RequestBody CrmEntryDto dto) {
        CrmEntryDto created = crmService.createEntry(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize(
            "hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPER_ADMIN') or hasAuthority('ROLE_EMPLOYEE')"
    )
    public ResponseEntity<CrmEntryDto> updateEntry(@PathVariable Long id, @RequestBody CrmEntryDto dto) {
        CrmEntryDto updated = crmService.updateEntry(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        crmService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}