package com.incial.crm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String status;

    @Column(length = 50)
    private String priority;

    @Column(name = "assigned_to", length = 255)
    private String assignedTo;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "task_type", length = 50)
    private String taskType;

    @Convert(converter = StringListConverter.class)
    @Column(name = "attachments", columnDefinition = "TEXT")
    private List<String> attachments;

    @Column(name = "task_link", columnDefinition = "TEXT")
    private String taskLink;

    @Column(name = "is_visible_on_main_board")
    private Boolean isVisibleOnMainBoard;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_updated_by", length = 255)
    private String lastUpdatedBy;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastUpdatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdatedAt = LocalDateTime.now();
    }
}
