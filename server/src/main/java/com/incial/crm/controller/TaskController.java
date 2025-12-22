package com.incial.crm.controller;

import com.incial.crm.dto.TaskDto;
import com.incial.crm.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@CrossOrigin(origins = "*")
@Tag(name = "Tasks", description = "Task management APIs")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    @Operation(summary = "Get all tasks", description = "Retrieve all tasks")
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/my-tasks")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    @Operation(summary = "Get current user's tasks", description = "Retrieve tasks assigned to the current logged-in user")
    public ResponseEntity<List<TaskDto>> getMyTasks(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(taskService.getCurrentUserTasks(userEmail));
    }

    @GetMapping("/client-tasks")
    @PreAuthorize("hasAuthority('ROLE_CLIENT')")
    @Operation(summary = "Get client's CRM tasks", description = "Retrieve tasks for the client's linked CRM entry")
    public ResponseEntity<List<TaskDto>> getClientTasks(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(taskService.getClientTasks(userEmail));
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority( 'ROLE_CLIENT' ,'ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    @Operation(summary = "Create a new task", description = "Create a new task")
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskDto dto) {
        TaskDto created = taskService.createTask(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN', 'ROLE_CLIENT')")
    @Operation(summary = "Update a task", description = "Update an existing task (increments user counter when status changes to completed)")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @RequestBody TaskDto dto) {
        TaskDto updated = taskService.updateTask(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    @Operation(summary = "Delete a task", description = "Delete a task by ID")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
