package com.complaint.repository;

import com.complaint.entity.Complaint;
import com.complaint.entity.ComplaintStatus;
import com.complaint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUser(User user);

    List<Complaint> findByEngineer(User engineer);

    List<Complaint> findByStatus(ComplaintStatus status);

    List<Complaint> findByEngineerAndStatus(User engineer, ComplaintStatus status);

    List<Complaint> findByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
