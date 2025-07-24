package com.example.chat.service;

import com.example.chat.dto.MessageDto;
import com.example.chat.entity.Message;
import com.example.chat.entity.MessageReadStatus;
import com.example.chat.entity.User;
import com.example.chat.jwt.CryptoUtil;
import com.example.chat.mapper.MessageMapper;
import com.example.chat.repository.MessageReadStatusRepository;
import com.example.chat.repository.MessageRepository;
import com.example.chat.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageReadStatusRepository messageReadStatusRepository;

    @Autowired
    private UserService userService;

    public MessageDto sendMessage(String content, Long senderId, Long receiverId) {
        Optional<User> senderOpt = userRepository.findById(senderId);
        Optional<User> receiverOpt = userRepository.findById(receiverId);
        String encrypted = CryptoUtil.encrypt(content);
        if (senderOpt.isPresent() && receiverOpt.isPresent()) {
            Message message = new Message();
            message.setContent(content);
            message.setSender(senderOpt.get());
            message.setReceiver(receiverOpt.get());
            message.setTime(ZonedDateTime.now());
            message.setIsDeleted(Boolean.FALSE);
            message.setRead(false);
            message.setEncryptedContent(encrypted);
            return MessageMapper.INSTANCE.toMessageDto(messageRepository.save(message));
        }
        return null;
    }

    @Transactional
    public void markAsRead(Long messageId, Long userId) {
        messageRepository.findById(messageId).ifPresent(message -> {
            message.setRead(true);
        });
        if (!messageReadStatusRepository.existsByMessageIdAndUserId(messageId, userId)) {
            MessageReadStatus mrs = new MessageReadStatus();
            mrs.setMessageId(messageId);
            mrs.setUserId(userId);
            mrs.setReadAt(OffsetDateTime.now(ZoneOffset.UTC));
            messageReadStatusRepository.save(mrs);
        }
    }

    public boolean isRead(Long messageId, Long userId) {
        return messageReadStatusRepository.existsByMessageIdAndUserId(messageId, userId);
    }

    public long readCount(Long messageId) {
        return messageReadStatusRepository.countByMessageId(messageId);
    }

    public List<Long> getContacts(Long id) {
        User user = userService.findById(id);
        List<Message> sentMessages = messageRepository.findBySender(user);
        List<Message> receivedMessages = messageRepository.findByReceiver(user);
        // Use a set to avoid duplicates
        Set<Long> contactIds = new HashSet<>();

        for (Message message : sentMessages) {
            if(message.getIsVisible()) {
                Long receiverId = message.getReceiver().getId();
                if (!receiverId.equals(id)) {
                    contactIds.add(receiverId);
                }
            }
        }
        for (Message message : receivedMessages) {
            if(message.getIsVisible()) {
                Long senderId = message.getSender().getId();
                if (!senderId.equals(id)) {
                    contactIds.add(senderId);
                }
            }
        }
        return new ArrayList<>(contactIds);
    }

    public List<MessageDto> getMessagesBetweenUsers(Long user1Id, Long user2Id) {
        User user1 = userService.findById(user1Id);
        User user2 = userService.findById(user2Id);

        if (user1 == null || user2 == null) {
            return Collections.emptyList();
        }
        List<Message> messages1 = messageRepository.findBySenderAndReceiver(user1, user2);
        List<Message> messages2 = messageRepository.findBySenderAndReceiver(user2, user1);
        List<Message> allMessages = new ArrayList<>();
        allMessages.addAll(messages1);
        allMessages.addAll(messages2);
        allMessages = allMessages.stream()
                .filter(msg -> Boolean.TRUE.equals(msg.getIsVisible()))
                .peek(msg -> {
                    if (Boolean.TRUE.equals(msg.getIsDeleted())) {
                        if (Boolean.TRUE.equals(msg.getImage())) {
                            msg.setImage(false);
                        }
                        msg.setContent("This message has been deleted");
                    }
                }).collect(Collectors.toList());


        allMessages.sort(Comparator.comparing(Message::getTime));
        return MessageMapper.INSTANCE.toMessageDtoList(allMessages);
    }

    public Message getMessageById(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }

    @Transactional
    public void deleteById(Long id) {
        boolean flag = messageRepository.findById(id).orElseThrow().getImage();
        if(flag) {
            messageRepository.findById(id).ifPresent(message -> {
                if(message.getIsDeleted().equals(Boolean.TRUE)){
                    messageRepository.deleteById(id);
                } else {
                    message.setIsDeleted(Boolean.TRUE);
                }
            });
        }else {
        messageRepository.findById(id).ifPresent(message -> {
            if(message.getImage()){
                message.setImage(false);
                message.setIsDeleted(Boolean.TRUE);
            }else {
                if (message.getIsDeleted().equals(Boolean.FALSE)) {
                    message.setIsDeleted(Boolean.TRUE);
                } else {
                    message.setIsVisible(Boolean.FALSE);
                }
            }
        });
        }
    }

    public Message updateById(Long id, String content) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setContent(content);
        return messageRepository.save(message);
    }


    @Transactional
    public void deleteMessagesByUser(Long userId, Long id) {
        User user = userRepository.findById(userId).orElseThrow();
        User user2 = userRepository.findById(id).orElseThrow();
        List<Message> messages = messageRepository.findBySenderAndReceiver(user, user2);
        List<Message> messages2 = messageRepository.findBySenderAndReceiver(user2, user);
        messages.addAll(messages2);
        messages.forEach(msg -> msg.setIsVisible(false));
    }
}
