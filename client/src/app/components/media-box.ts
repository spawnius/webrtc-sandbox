import {Component, View, CORE_DIRECTIVES, FORM_DIRECTIVES, NgZone} from 'angular2/angular2'
import {ConnectService} from '../services/connect'
import {NavigatorService} from '../services/navigator'
import {MediaStream} from '../models/media-stream'
import {MediaItemComponent} from './media-item'

@Component({
    selector: 'media-box',
    template: `
        <media-item *ng-for="#mediaStream of mediaStreams"
            [media]="mediaStream"></media-item>
        `,
    directives: [
        CORE_DIRECTIVES,
        FORM_DIRECTIVES,
        MediaItemComponent
    ]
})
export class MediaBoxComponent {
    connectService: ConnectService;
    navigatorService: NavigatorService;
    mediaStreams: Array<MediaStream> = [];
    zone: NgZone;

    constructor(connectService: ConnectService, navigatorService: NavigatorService, zone: NgZone) {
        this.navigatorService = navigatorService;
        this.zone = zone;
        this.connectService = connectService;

        this.connectService.getCallStream().subscribe(stream => {
            this.addMediaStream(stream);
        });
    }

    private addMediaStream(stream) {
        let callURL = this.navigatorService.createObjectURL(stream);
        let mediaStream: MediaStream = new MediaStream(callURL, true, stream);

        // When the stream ends we remove it from the list
        // TODO: create an event emmiter in the service for this
        stream.addEventListener("ended", (e) => {
            this.removeMediaStream(e.currentTarget);
        });

        this.zone.run(() => {
            this.mediaStreams.push(mediaStream);
        });
    }

    // Removes a stream by reference
    // TODO: implement a faster way to detect a disconnected user
    private removeMediaStream(stream) {
        for (var i = 0; i < this.mediaStreams.length; i++) {
            if (this.mediaStreams[i].stream.id === stream.id) {
                this.zone.run(() => {
                    this.mediaStreams.splice(i, 1);
                });
                return true;
            }
        }

        return false;
    }
}