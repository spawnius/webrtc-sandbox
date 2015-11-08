import {Component, View, CORE_DIRECTIVES, FORM_DIRECTIVES, NgZone} from 'angular2/angular2'
import {ConnectService} from '../services/connect'

@Component({
    selector: 'chat-box',
    properties: ['messages'],
    template: `
        <div>
            <h2>Messages:</h2>
            <div *ng-for="#msg of messages">
                <div>{{msg}}</div>
            </div>
            <input #msg
            (keyup.enter)="sendMessage(msg)">
            <button (click)="sendMessage(msg)">Send</button>
        </div>
        `,
    directives: [
        CORE_DIRECTIVES,
        FORM_DIRECTIVES
    ]    
})
export class ChatBoxComponent {
    connectService: ConnectService;
    connections: Array<any> = [];
    messages: Array<string> = [];
    zone: NgZone;

    constructor(connectService: ConnectService, zone: NgZone) {
        this.zone = zone;
        this.connectService = connectService;

        this.connectService.getDataStream().subscribe(conn => {
            // Start using the connection
            console.log(conn.peer);
            this.connections.push(conn);

            conn.on('data', data => {
                this.zone.run(() => {
                    this.messages.push(`${conn.metadata.id}: ${data}`);
                });
            })
        });
    }

    sendMessage(msg) {
        this.messages.push(msg.value);
        this.connections.forEach(conn => {
            conn.send(msg.value);
        });
    }

}