package com.incial.crm.controller;

import com.incial.crm.dto.TaskDto;
import com.incial.crm.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    @Operation(summary = "Get all tasks", description = "Retrieve all tasks")
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        log.info("GET /api/v1/tasks/all - Retrieving all tasks");
        try {
            List<TaskDto> tasks = taskService.getAllTasks();
            log.info("GET /api/v1/tasks/all - Successfully retrieved {} tasks", tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("GET /api/v1/tasks/all - Error retrieving all tasks", e);
            throw e;
        }
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    @Operation(summary = "Get active tasks", description = "Retrieve all non-completed tasks (excluding Completed, Done, and Posted status)")
    public ResponseEntity<List<TaskDto>> getActiveTasks() {
        log.info("GET /api/v1/tasks/active - Retrieving active tasks");
        try {
            List<TaskDto> tasks = taskService.getActiveTasks();
            log.info("GET /api/v1/tasks/active - Successfully retrieved {} active tasks", tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("GET /api/v1/tasks/active - Error retrieving active tasks", e);
            throw e;
        }
    }

    @GetMapping("/completed")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    @Operation(summary = "Get completed tasks", description = "Retrieve all completed tasks (Completed, Done, or Posted status)")
    public ResponseEntity<List<TaskDto>> getCompletedTasks() {
        log.info("GET /api/v1/tasks/completed - Retrieving completed tasks");
        try {
            List<TaskDto> tasks = taskService.getCompletedTasks();
            log.info("GET /api/v1/tasks/completed - Successfully retrieved {} completed tasks", tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("GET /api/v1/tasks/completed - Error retrieving completed tasks", e);
            throw e;
        }
    }

    @GetMapping("/my-tasks")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    @Operation(summary = "Get current user's tasks", description = "Retrieve tasks assigned to the current logged-in user")
    public ResponseEntity<List<TaskDto>> getMyTasks(Authentication authentication) {
        String userEmail = authentication.getName();
        log.info("GET /api/v1/tasks/my-tasks - Retrieving tasks for authenticated user");
        try {
            List<TaskDto> tasks = taskService.getCurrentUserTasks(userEmail);
            log.info("GET /api/v1/tasks/my-tasks - Successfully retrieved {} tasks", tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("GET /api/v1/tasks/my-tasks - Error retrieving tasks for user", e);
            throw e;
        }
    }

    @GetMapping("/client-tasks")
    @PreAuthorize("hasAuthority('ROLE_CLIENT')")
    @Operation(summary = "Get client's CRM tasks", description = "Retrieve tasks for the client's linked CRM entry")
    public ResponseEntity<List<TaskDto>> getClientTasks(Authentication authentication) {
        String userEmail = authentication.getName();
        log.info("GET /api/v1/tasks/client-tasks - Retrieving client tasks for authenticated user");
        try {
            List<TaskDto> tasks = taskService.getClientTasks(userEmail);
            log.info("GET /api/v1/tasks/client-tasks - Successfully retrieved {} tasks", tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("GET /api/v1/tasks/client-tasks - Error retrieving client tasks", e);
            throw e;
        }
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority( 'ROLE_CLIENT' ,'ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    @Operation(summary = "Create a new task", description = "Create a new task")
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskDto dto) {
        String taskTitle = dto.getTitle() != null ? dto.getTitle() : "Untitled";
        log.info("POST /api/v1/tasks/create - Creating new task: {}", taskTitle);
        try {
            TaskDto created = taskService.createTask(dto);
            log.info("POST /api/v1/tasks/create - Successfully created task with ID: {}", created.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("POST /api/v1/tasks/create - Error creating task: {}", taskTitle, e);
            throw e;
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN', 'ROLE_CLIENT')")
    @Operation(summary = "Update a task", description = "Update an existing task (increments user counter when status changes to completed)")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @RequestBody TaskDto dto) {
        log.info("PUT /api/v1/tasks/update/{} - Updating task", id);
        try {
            TaskDto updated = taskService.updateTask(id, dto);
            log.info("PUT /api/v1/tasks/update/{} - Successfully updated task, new status: {}", id, updated.getStatus());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("PUT /api/v1/tasks/update/{} - Error updating task", id, e);
            throw e;
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
    @Operation(summary = "Delete a task", description = "Delete a task by ID")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        log.info("DELETE /api/v1/tasks/delete/{} - Deleting task", id);
        try {
            taskService.deleteTask(id);
            log.info("DELETE /api/v1/tasks/delete/{} - Successfully deleted task", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("DELETE /api/v1/tasks/delete/{} - Error deleting task", id, e);
            throw e;
        }
    }
}
