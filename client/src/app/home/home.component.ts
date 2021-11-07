import {Component, OnInit, ViewChild} from '@angular/core';
import {
    createLocalAudioTrack,
    createLocalVideoTrack,
    LocalAudioTrack,
    LocalTrack,
    LocalVideoTrack,
    RemoteParticipant,
    Room
} from 'twilio-video';
import {RoomsComponent} from '../rooms/rooms.component';
import {CameraComponent} from '../camera/camera.component';
import {SettingsComponent} from '../settings/settings.component';
import {ParticipantsComponent} from '../participants/participants.component';
import {VideoChatService} from '../services/videochat.service';

@Component({
    selector: 'app-home',
    styleUrls: ['./home.component.css'],
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
    @ViewChild('rooms') rooms: RoomsComponent;
    @ViewChild('camera') camera: CameraComponent;
    @ViewChild('settings') settings: SettingsComponent;
    @ViewChild('participants') participants: ParticipantsComponent;

    activeRoom: Room;

    constructor(
        private readonly videoChatService: VideoChatService) {
    }

    async ngOnInit() {
        /*const builder =
            new HubConnectionBuilder()
                .configureLogging(LogLevel.Information)
                .withUrl(`${environment.api}/notificationHub`);

        this.notificationHub = builder.build();
        this.notificationHub.on('RoomsUpdated', async updated => {
            if (updated) {
                await this.rooms.updateRooms();
            }
        });
        await this.notificationHub.start();*/
        if (this.rooms) {
            this.rooms.updateRooms()
        }
    }

    async onSettingsChanged(deviceInfo?: MediaDeviceInfo) {
        await this.camera.initializePreview(deviceInfo.deviceId);
        if (this.settings.isPreviewing) {
            const track = await this.settings.showPreviewCamera();
            if (this.activeRoom) {
                const localParticipant = this.activeRoom.localParticipant;
                localParticipant.videoTracks.forEach(publication => publication.unpublish());
                await localParticipant.publishTrack(track);
            }
        }
    }

    async onLeaveRoom(_: boolean) {
        if (this.activeRoom) {
            this.activeRoom.disconnect();
            this.activeRoom = null;
        }

        const videoDevice = this.settings.hidePreviewCamera();
        await this.camera.initializePreview(videoDevice && videoDevice.deviceId);

        this.participants.clear();
    }

    async onRoomChanged(roomName: string) {
        if (roomName) {
            if (this.activeRoom) {
                this.activeRoom.disconnect();
            }

            this.camera.finalizePreview();

            const tracks = await Promise.all([
                createLocalAudioTrack(),
                this.settings.showPreviewCamera()
            ]);

            this.activeRoom =
                await this.videoChatService
                    .joinOrCreateRoom(roomName, tracks);

            this.participants.initialize(this.activeRoom.participants);
            this.registerRoomEvents();
        }
    }

    onParticipantsChanged(_: boolean) {
        this.videoChatService.nudge();
    }

    private registerRoomEvents() {
        this.activeRoom
            .on('disconnected',
                (room: Room) => room.localParticipant.tracks.forEach(publication => this.detachLocalTrack(publication.track)))
            .on('participantConnected',
                (participant: RemoteParticipant) => this.participants.add(participant))
            .on('participantDisconnected',
                (participant: RemoteParticipant) => this.participants.remove(participant))
            .on('dominantSpeakerChanged',
                (dominantSpeaker: RemoteParticipant) => this.participants.loudest(dominantSpeaker));
    }

    private detachLocalTrack(track: LocalTrack) {
        if (this.isDetachable(track)) {
            track.detach().forEach(el => el.remove());
        }
    }

    private isDetachable(track: LocalTrack): track is LocalAudioTrack | LocalVideoTrack {
        return !!track
            && ((track as LocalAudioTrack).detach !== undefined
                || (track as LocalVideoTrack).detach !== undefined);
    }
}