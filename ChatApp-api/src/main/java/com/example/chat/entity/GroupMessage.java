package com.example.chat.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

@Entity
@Data
@Table(name = "chat_group_message_table")
public class GroupMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;
    private ZonedDateTime time = ZonedDateTime.now(ZoneOffset.UTC);;
    @ManyToOne
    @ToString.Exclude
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;
    @Column(name = "read_status", nullable = false)
    private Boolean read = false;
    @Column(name = "image", nullable = true)
    private Boolean image = false;
    @Column(name = "file", nullable = true)
    private Boolean file = false;
    @Column(name = "audio", nullable = true)
    private Boolean audio = false;
    @Column(name = "encrypted_content", nullable = true)
    private String encryptedContent;
}
