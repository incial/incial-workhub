package com.incial.crm.repository;

import com.incial.crm.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
