package com.incial.crm.service;

import com.incial.crm.dto.TaskDto;
import com.incial.crm.entity.Task;
import com.incial.crm.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getTasksByAssignedTo(String assignedTo) {
        return taskRepository.findByAssignedTo(assignedTo).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getCurrentUserTasks(String userEmail) {
        // Get user by email to find their name
        // Tasks are assigned by name, not email
        return taskRepository.findAll().stream()
                .filter(task -> task.getAssignedTo() != null && 
                               task.getAssignedTo().contains(userEmail.split("@")[0]))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TaskDto createTask(TaskDto dto) {
        Task task = convertToEntity(dto);
        Task saved = taskRepository.save(task);
        return convertToDto(saved);
    }

    public TaskDto updateTask(Long id, TaskDto dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        // Check if task is being marked as completed
        String oldStatus = task.getStatus();
        boolean wasCompleted = "completed".equalsIgnoreCase(oldStatus);
        
        updateEntityFromDto(task, dto);
        
        // If status changed to completed and task is assigned, increment user's counter
        String newStatus = task.getStatus();
        boolean isNowCompleted = "completed".equalsIgnoreCase(newStatus);
        
        if (!wasCompleted && isNowCompleted && task.getAssignedTo() != null && !task.getAssignedTo().isEmpty()) {
            // Try to find user by email in assignedTo field
            String assignedTo = task.getAssignedTo();
            // Check if it's an email format
            if (assignedTo.contains("@")) {
                try {
                    userService.incrementTasksCompleted(assignedTo);
                } catch (Exception e) {
                    // User not found or error - log and continue
                    System.out.println("Could not increment tasks for user: " + assignedTo);
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
        return TaskDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .assignedTo(entity.getAssignedTo())
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
        if (dto.getAssignedTo() != null) entity.setAssignedTo(dto.getAssignedTo());
        if (dto.getDueDate() != null) entity.setDueDate(dto.getDueDate());
        if (dto.getCompanyId() != null) entity.setCompanyId(dto.getCompanyId());
        if (dto.getTaskType() != null) entity.setTaskType(dto.getTaskType());
        if (dto.getAttachments() != null) entity.setAttachments(dto.getAttachments());
        if (dto.getTaskLink() != null) entity.setTaskLink(dto.getTaskLink());
        if (dto.getIsVisibleOnMainBoard() != null) entity.setIsVisibleOnMainBoard(dto.getIsVisibleOnMainBoard());
        entity.setLastUpdatedBy(user);
    }
}
