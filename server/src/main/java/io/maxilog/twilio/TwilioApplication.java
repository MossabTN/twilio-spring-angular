package io.maxilog.twilio;

import com.twilio.Twilio;
import io.maxilog.twilio.config.TwilioConfigurationProperties;
import lombok.AllArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

import javax.annotation.PostConstruct;


@AllArgsConstructor
@ConfigurationPropertiesScan
@SpringBootApplication
public class TwilioApplication {

    private final TwilioConfigurationProperties twilioConfigurationProperties;

    public static void main(String[] args) {
        SpringApplication.run(TwilioApplication.class, args);
    }

    @PostConstruct
    public void setTwilioConfiguration() {
        Twilio.init(twilioConfigurationProperties.getApiKey(), twilioConfigurationProperties.getApiSecret());
    }
}

