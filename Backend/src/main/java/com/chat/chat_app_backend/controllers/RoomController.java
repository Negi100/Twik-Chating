package com.chat.chat_app_backend.controllers;

import com.chat.chat_app_backend.entities.Message;
import com.chat.chat_app_backend.entities.Room;
import com.chat.chat_app_backend.repo.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    //create room
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId){
        roomId = roomId == null ? "" : roomId.trim();
        if(roomId.isEmpty()){
            return ResponseEntity.badRequest().body("Room id is required");
        }
        if(roomRepository.findByRoomId(roomId) != null){
            return ResponseEntity.badRequest().body("Room already exists");
        }

        Room room = new Room();
        room.setRoomId(roomId);
        Room savedRoom = roomRepository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
    }

    //get room
    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId){
            Room room = roomRepository.findByRoomId(roomId);

            if(room == null){
                return ResponseEntity.badRequest().body("Room not found!!");
            }

            return ResponseEntity.ok(room);
    }

    //get message of room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessage(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "20", required = false) int size
            ){

        Room room = roomRepository.findByRoomId(roomId);

        if(room == null){
            return ResponseEntity.badRequest().build();
        }
        //get messages:
        List<Message> messages= room.getMessage();

        //pagination
        int start= Math.max(0, messages.size()- (page+1)*size);
        int end = Math.min(messages.size(), start + size);
        List<Message> paginnated = messages.subList(start,end);

        return ResponseEntity.ok(paginnated);
    }

}
