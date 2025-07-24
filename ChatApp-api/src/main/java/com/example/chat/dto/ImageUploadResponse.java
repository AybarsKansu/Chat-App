package com.example.chat.dto;

import lombok.Data;

@Data
public class ImageUploadResponse {
    private Long id;
    private String url;

    public ImageUploadResponse(Long id, String url) {
        this.id = id;
        this.url = url;
    }

}

