package com.incial.crm.repository;

import com.incial.crm.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedTo(String assignedTo);
    List<Task> findByCompanyId(Long companyId);
    
    // Optimized queries for completed vs non-completed tasks
    @Query("SELECT t FROM Task t WHERE LOWER(t.status) NOT IN ('completed', 'done', 'posted')")
    List<Task> findAllActiveTasks();
    
    @Query("SELECT t FROM Task t WHERE LOWER(t.status) IN ('completed', 'done', 'posted')")
    List<Task> findAllCompletedTasks();
    
    // Optimized query for tasks assigned to a specific user (supports multi-assignee)
    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN t.assignees a WHERE " +
           "LOWER(a.assigneeEmail) = LOWER(:userEmail) OR " +
           "LOWER(t.assignedTo) = LOWER(:userEmail) OR " +
           "LOWER(t.assignedTo) LIKE LOWER(CONCAT('%', :userName, '%'))")
    List<Task> findTasksByUserEmail(@Param("userEmail") String userEmail, @Param("userName") String userName);
}
