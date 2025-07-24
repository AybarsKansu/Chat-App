package com.example.chat.repository;

import com.example.chat.entity.Message;
import com.example.chat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderAndReceiver(User sender, User receiver);

    List<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverId(Long userId1, Long userId2, Long userId21, Long userId11);

    List<Message> findBySender(User user);

    List<Message> findByReceiver(User user);
}
