package com.chat.chat_app_backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    // Used by the hosting platform's health check, and handy for a quick "is it up?" test.
    @GetMapping({"/", "/health"})
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
