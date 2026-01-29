package com.incial.crm.service;

import com.incial.crm.dto.TaskDto;
import com.incial.crm.entity.Task;
import com.incial.crm.entity.TaskAssignee;
import com.incial.crm.repository.TaskRepository;
import com.incial.crm.repository.TaskAssigneeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasksByAssignedTo(String assignedTo) {
        return taskRepository.findByAssignedTo(assignedTo).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getCurrentUserTasks(String userEmail) {
        // Get tasks where the user is one of the assignees
        return taskRepository.findAll().stream()
                .filter(task -> {
                    // Check new assignees list
                    if (task.getAssignees() != null && !task.getAssignees().isEmpty()) {
                        return task.getAssignees().stream()
                                .anyMatch(assignee -> assignee.getAssigneeEmail().equalsIgnoreCase(userEmail));
                    }
                    // Fallback to old assignedTo field for backward compatibility
                    if (task.getAssignedTo() != null) {
                        return task.getAssignedTo().contains(userEmail.split("@")[0]) ||
                                task.getAssignedTo().equalsIgnoreCase(userEmail);
                    }
                    return false;
                })
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasksByCompanyId(Long companyId) {
        return taskRepository.findByCompanyId(companyId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getClientTasks(String userEmail) {
        // Get user to find their linked CRM ID
        var userDto = userService.getUserByEmail(userEmail);
        if (userDto.getClientCrmId() == null) {
            throw new RuntimeException("Client user '" + userEmail + "' is not linked to any CRM entry. Please contact administrator.");
        }
        return getTasksByCompanyId(userDto.getClientCrmId());
    }

    @Transactional
    public TaskDto createTask(TaskDto dto) {
        Task task = convertToEntity(dto);
        Task saved = taskRepository.save(task);

        // Handle assignees
        if (dto.getAssignedToList() != null && !dto.getAssignedToList().isEmpty()) {
            syncTaskAssignees(saved, dto.getAssignedToList());
        }

        return convertToDto(saved);
    }

    @Transactional
    public TaskDto updateTask(Long id, TaskDto dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // Check if task is being marked as completed
        String oldStatus = task.getStatus();
        boolean wasCompleted = "completed".equalsIgnoreCase(oldStatus);

        updateEntityFromDto(task, dto);

        // Handle assignees update
        if (dto.getAssignedToList() != null) {
            syncTaskAssignees(task, dto.getAssignedToList());
        }

        // If status changed to completed, increment counter for all assignees
        String newStatus = task.getStatus();
        boolean isNowCompleted = "completed".equalsIgnoreCase(newStatus);

        if (!wasCompleted && isNowCompleted) {
            // Increment for all assignees in the new system
            if (task.getAssignees() != null && !task.getAssignees().isEmpty()) {
                for (TaskAssignee assignee : task.getAssignees()) {
                    try {
                        userService.incrementTasksCompleted(assignee.getAssigneeEmail());
                    } catch (Exception e) {
                        log.warn("Could not increment tasks for user: {}", assignee.getAssigneeEmail(), e);
                    }
                }
            }
            // Fallback for old single assignedTo field (backward compatibility)
            else if (task.getAssignedTo() != null && !task.getAssignedTo().isEmpty()) {
                String assignedTo = task.getAssignedTo();
                if (assignedTo.contains("@")) {
                    try {
                        userService.incrementTasksCompleted(assignedTo);
                    } catch (Exception e) {
                        log.warn("Could not increment tasks for user: {}", assignedTo, e);
                    }
                }
            }
        }

        Task updated = taskRepository.save(task);
        return convertToDto(updated);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    private TaskDto convertToDto(Task entity) {
        TaskDto dto = TaskDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .assignedTo(entity.getAssignedTo()) // Keep for backward compatibility
                .dueDate(entity.getDueDate())
                .companyId(entity.getCompanyId())
                .taskType(entity.getTaskType())
                .attachments(entity.getAttachments())
                .taskLink(entity.getTaskLink())
                .isVisibleOnMainBoard(entity.getIsVisibleOnMainBoard())
                .createdAt(entity.getCreatedAt())
                .lastUpdatedBy(entity.getLastUpdatedBy())
                .lastUpdatedAt(entity.getLastUpdatedAt())
                .build();

        // Populate new assignedToList from assignees
        if (entity.getAssignees() != null && !entity.getAssignees().isEmpty()) {
            dto.setAssignedToList(entity.getAssignees().stream()
                    .map(TaskAssignee::getAssigneeEmail)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private Task convertToEntity(TaskDto dto) {
        return Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .priority(dto.getPriority())
                .assignedTo(dto.getAssignedTo())
                .dueDate(dto.getDueDate())
                .companyId(dto.getCompanyId())
                .taskType(dto.getTaskType())
                .attachments(dto.getAttachments())
                .taskLink(dto.getTaskLink())
                .isVisibleOnMainBoard(dto.getIsVisibleOnMainBoard())
                .lastUpdatedBy(dto.getLastUpdatedBy())
                .build();
    }

    private void updateEntityFromDto(Task entity, TaskDto dto) {
        String user = UserService.getCurrentUsername();

        if (dto.getTitle() != null) entity.setTitle(dto.getTitle());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getPriority() != null) entity.setPriority(dto.getPriority());
        if (dto.getAssignedTo() != null) entity.setAssignedTo(dto.getAssignedTo()); // Keep for backward compatibility
        if (dto.getDueDate() != null) entity.setDueDate(dto.getDueDate());
        if (dto.getCompanyId() != null) entity.setCompanyId(dto.getCompanyId());
        if (dto.getTaskType() != null) entity.setTaskType(dto.getTaskType());
        if (dto.getAttachments() != null) entity.setAttachments(dto.getAttachments());
        if (dto.getTaskLink() != null) entity.setTaskLink(dto.getTaskLink());
        if (dto.getIsVisibleOnMainBoard() != null) entity.setIsVisibleOnMainBoard(dto.getIsVisibleOnMainBoard());
        entity.setLastUpdatedBy(user);
    }

    private void syncTaskAssignees(Task task, List<String> assigneeEmails) {
        // Initialize assignees list if null
        if (task.getAssignees() == null) {
            task.setAssignees(new ArrayList<>());
        }

        // Remove existing assignees
        task.getAssignees().clear();

        // Remove duplicates and filter invalid emails
        Set<String> uniqueEmails = new HashSet<>();
        for (String email : assigneeEmails) {
            if (email != null && !email.trim().isEmpty() && !email.equalsIgnoreCase("unassigned")) {
                uniqueEmails.add(email.trim().toLowerCase());
            }
        }

        // Add new assignees
        for (String email : uniqueEmails) {
            try {
                var user = userService.getUserByEmail(email);
                TaskAssignee assignee = TaskAssignee.builder()
                        .task(task)
                        .assigneeEmail(email)
                        .assigneeName(user.getName())
                        .build();
                task.getAssignees().add(assignee);
            } catch (Exception e) {
                log.warn("User not found for email: {}, adding with email only", email);
                // User not found, add with email only
                TaskAssignee assignee = TaskAssignee.builder()
                        .task(task)
                        .assigneeEmail(email)
                        .assigneeName(email)
                        .build();
                task.getAssignees().add(assignee);
            }
        }
    }
}
