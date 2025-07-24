package com.example.chat.repository;

import com.example.chat.entity.MessageReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageReadStatusRepository extends JpaRepository<MessageReadStatus, Long> {
    boolean existsByMessageIdAndUserId(Long messageId, Long userId);
    long countByMessageId(Long messageId);
    List<MessageReadStatus> findByMessageId(Long messageId);
}
