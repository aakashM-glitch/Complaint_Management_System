package com.complaint.repository;

import com.complaint.entity.Complaint;
import com.complaint.entity.Payment;
import com.complaint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByComplaint(Complaint complaint);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByUser(User user);

    List<Payment> findByStatus(String status);
}
