import {connect, ConnectOptions, LocalTrack, Room} from 'twilio-video';
import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, ReplaySubject} from 'rxjs';
import {environment} from "../../environments/environment";

interface AuthToken {
    token: string;
}

export interface NamedRoom {
    id: string;
    uniqueName?: string;
    maxParticipants?: number;
    participants: number;
}

export type Rooms = NamedRoom[];

@Injectable()
export class VideoChatService implements OnDestroy {
    $roomsUpdated: Observable<boolean>;

    private roomBroadcast = new ReplaySubject<boolean>();

    constructor(private readonly http: HttpClient) {
        this.$roomsUpdated = this.roomBroadcast.asObservable();
    }

    getAllRooms() {
        return this.http
            .get<Rooms>(`${environment.api}/api/video/rooms`)
            .toPromise();
    }

    createRoom(roomName: string) {
        return this.http
            .post<NamedRoom>(`${environment.api}/api/video/rooms/${roomName}`, {})
            .toPromise();
    }

    async joinOrCreateRoom(name: string, tracks: LocalTrack[]) {
        let room: Room = null;
        try {
            const token: string = await this.getAuthToken(name);
            room =
                await connect(
                    token, {
                        name,
                        tracks,
                        dominantSpeaker: true
                    } as ConnectOptions);
        } catch (error) {
            console.error(`Unable to connect to Room: ${error.message}`);
        } finally {
            if (room) {
                this.roomBroadcast.next(true);
            }
        }

        return room;
    }

    nudge() {
        this.roomBroadcast.next(true);
    }

    ngOnDestroy(): void {
        if (this.roomBroadcast) {
            this.roomBroadcast.unsubscribe();
        }
    }

    private async getAuthToken(roomName: string) {
        const auth =
            await this.http
                .get(`${environment.api}/api/video/rooms/${roomName}/token`, {responseType: "text"})
                .toPromise();

        return auth;
    }
}