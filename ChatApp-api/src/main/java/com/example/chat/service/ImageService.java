package com.example.chat.service;

import com.example.chat.dto.GroupMessageDto;
import com.example.chat.dto.MessageDto;
import com.example.chat.entity.GroupMessage;
import com.example.chat.entity.Message;
import com.example.chat.mapper.GroupMessageMapper;
import com.example.chat.mapper.MessageMapper;
import com.example.chat.repository.GroupMessageRepository;
import com.example.chat.repository.GroupRepository;
import com.example.chat.repository.MessageRepository;
import com.example.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.ZonedDateTime;
import java.util.UUID;

@Service
public class ImageService {

    private final Path rootLocation = Paths.get("uploads/images");

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private GroupMessageRepository groupMessageRepository;

    public MessageDto store(MultipartFile file, Long senderId, Long receiverId) {
        try {
            // 1) Hedef dizin(ler) yoksa oluştur:
            if (Files.notExists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }

            // 2) Dosya adını UUID’li hale getir:
            String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();

            // 3) Geçici dosyayı kalıcı klasöre taşı:
            Path destinationFile = rootLocation.resolve(
                            Paths.get(filename))
                    .normalize()
                    .toAbsolutePath();
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            Message msg = new Message();
            msg.setSender(userRepository.findById(senderId).orElseThrow());
            msg.setReceiver(userRepository.findById(receiverId).orElseThrow());
            msg.setContent("/images/" + filename);
            msg.setImage(true);
            msg.setTime(ZonedDateTime.now());
            msg.setIsDeleted(Boolean.FALSE);
            msg.setRead(false);

            return MessageMapper.INSTANCE.toMessageDto(messageRepository.save(msg));
        } catch (IOException e) {
            throw new RuntimeException("Resim yüklenemedi", e);
        }
    }

    public GroupMessageDto storeGroupMessage(MultipartFile file, Long senderId, Long receiverId) {
        try {
            // 1) Hedef dizin(ler) yoksa oluştur:
            if (Files.notExists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }

            // 2) Dosya adını UUID’li hale getir:
            String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();

            // 3) Geçici dosyayı kalıcı klasöre taşı:
            Path destinationFile = rootLocation.resolve(
                            Paths.get(filename))
                    .normalize()
                    .toAbsolutePath();
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            GroupMessage msg = new GroupMessage();
            msg.setSender(userRepository.findById(senderId).orElseThrow());
            msg.setGroup(groupRepository.findById(receiverId).orElseThrow());
            msg.setContent("/images/" + filename);
            msg.setImage(true);
            msg.setTime(ZonedDateTime.now());
            msg.setIsDeleted(Boolean.FALSE);
            msg.setRead(false);

            return GroupMessageMapper.INSTANCE.toGroupMessageDto(groupMessageRepository.save(msg));
        } catch (IOException e) {
            throw new RuntimeException("Resim yüklenemedi", e);
        }
    }
}
