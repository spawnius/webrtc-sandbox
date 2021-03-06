import {Component, View, NgZone} from 'angular2/core'
import {ConnectService} from '../services/connect'
import {NavigatorService} from '../services/navigator'
import {MediaStream} from '../models/media-stream'
import {MediaItemComponent} from './media-item'

@Component({
    selector: 'own-media-box',
    styleUrls: ['dist/css/components/own-media-box.css'],
    template: `
        <div class="own-media-box" *ngIf="mediaStream">
            <h3>Preview:</h3>
            <media-item [media]="mediaStream" [muted]="isMuted"></media-item>
        </div>    
        `,
    directives: [
        MediaItemComponent
    ]
})
export class OwnMediaBoxComponent {
    private connectService: ConnectService;
    private navigatorService: NavigatorService;
    private mediaStream: MediaStream;
    private isMuted: boolean;
    private zone: NgZone;

    constructor(connectService: ConnectService, navigatorService: NavigatorService, zone: NgZone) {
        this.navigatorService = navigatorService;
        this.zone = zone;
        this.connectService = connectService;

        this.connectService.getOwnMediaStream().subscribe(stream => {
            this.addMediaStream(stream);
        });

        this.connectService.getCallStream().subscribe(stream => {
            this.isMuted = true;
        });
    }

    private addMediaStream(stream) {
        let callURL = this.navigatorService.createObjectURL(stream);
        this.mediaStream = new MediaStream(callURL, true, stream);
    }
}