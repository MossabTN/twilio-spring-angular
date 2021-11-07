package io.maxilog.twilio.services;

import com.twilio.jwt.accesstoken.AccessToken;
import com.twilio.jwt.accesstoken.VideoGrant;
import com.twilio.jwt.accesstoken.VoiceGrant;
import com.twilio.rest.video.v1.Room;
import io.maxilog.twilio.config.TwilioConfigurationProperties;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@Service
public class TwilioService {

    private final TwilioConfigurationProperties twilioConfigurationProperties;

    public List<Room> getRooms() {
        return Room.reader().firstPage().getRecords();
    }

    public Room addRoom(String roomName) {
        return Room.creator().setUniqueName(roomName).create();
    }

    public String getAccessToken(String roomName) {
        String identity = "guest" + UUID.randomUUID();
        VoiceGrant voiceGrant = new VoiceGrant();
        voiceGrant.setIncomingAllow(true);
        voiceGrant.setOutgoingApplicationSid(twilioConfigurationProperties.getAccountSid());
        VideoGrant videoGrant = new VideoGrant();
        videoGrant.setRoom(roomName);
        AccessToken token = new AccessToken.Builder(twilioConfigurationProperties.getAccountSid(), twilioConfigurationProperties.getApiKey(), twilioConfigurationProperties.getApiSecret())
                .identity(identity).grants(List.of(videoGrant, voiceGrant)).build();
        return token.toJwt();
    }

}
