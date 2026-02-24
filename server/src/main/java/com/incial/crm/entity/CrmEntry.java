package com.incial.crm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "crm_entries", indexes = {
    @Index(name = "idx_crm_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrmEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String company;

    @Column(name = "contact_name", length = 255)
    private String contactName;

    @Column(length = 255)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 500)
    private String address;

    @Column(name = "company_image_url", columnDefinition = "TEXT")
    private String companyImageUrl;

    @Column(length = 50)
    private String status;

    @Column(name = "deal_value", precision = 15, scale = 2)
    private BigDecimal dealValue;

    @Column(name = "assigned_to", length = 255)
    private String assignedTo;

    @Column(name = "next_follow_up")
    private LocalDate nextFollowUp;

    @Column(name = "last_contact")
    private LocalDate lastContact;

    @Column(name = "reference_id", unique = true, length = 50)
    private String referenceId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Convert(converter = StringListConverter.class)
    @Column(length = 1000)
    private List<String> tags;

    @Convert(converter = StringListConverter.class)
    @Column(length = 1000)
    private List<String> work;

    @Convert(converter = StringListConverter.class)
    @Column(name = "lead_sources", length = 1000)
    private List<String> leadSources;

    @Column(name = "drive_link", columnDefinition = "TEXT")
    private String driveLink;

    @Convert(converter = StringMapConverter.class)
    @Column(length = 1000)
    private Map<String, String> socials;

    @Column(name = "last_updated_by", length = 255)
    private String lastUpdatedBy;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdatedAt = LocalDateTime.now();
    }
}
