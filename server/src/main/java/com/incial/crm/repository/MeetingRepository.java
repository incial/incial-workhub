package com.incial.crm.repository;

import com.incial.crm.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    
    // Find meetings assigned to a specific user
    @Query("SELECT m FROM Meeting m WHERE " +
           "LOWER(m.assignedTo) = LOWER(:userEmail) OR " +
           "LOWER(m.assignedTo) = LOWER(:userName) OR " +
           "LOWER(m.assignedTo) LIKE LOWER(CONCAT('%', :userName, '%'))")
    List<Meeting> findMeetingsByUser(@Param("userEmail") String userEmail, @Param("userName") String userName);
}
