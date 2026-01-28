package com.incial.crm.repository;

import com.incial.crm.entity.TaskAssignee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskAssigneeRepository extends JpaRepository<TaskAssignee, Long> {
    List<TaskAssignee> findByTaskId(Long taskId);
    List<TaskAssignee> findByAssigneeEmail(String assigneeEmail);
    
    @Modifying
    @Query("DELETE FROM TaskAssignee ta WHERE ta.task.id = :taskId")
    void deleteByTaskId(Long taskId);
}
