package io.maxilog.twilio.web;

import com.twilio.rest.video.v1.Room;
import io.maxilog.twilio.services.TwilioService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@AllArgsConstructor
@CrossOrigin
@RestController
@RequestMapping("/api/video")
public class TwilioController {

    private final TwilioService twilioService;

    @GetMapping("/rooms")
    public List<Room> getRooms() {
        return twilioService.getRooms();
    }

    @PostMapping("/rooms/{roomName}")
    public Room addRoom(@PathVariable String roomName) {
        return twilioService.addRoom(roomName);
    }

    @GetMapping("/rooms/{roomName}/token")
    public String getAccessToken(@PathVariable String roomName) {
        return twilioService.getAccessToken(roomName);
    }
}
