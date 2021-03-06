import {Inject, EventEmitter} from 'angular2/core'
import {PeerService} from './peer'
import {NavigatorService} from './navigator'

export class ConnectService {
    peerService: PeerService;
    navigatorService: NavigatorService;
    statusEmmiter: EventEmitter<any> = new EventEmitter();
    dataEmitter: EventEmitter<any> = new EventEmitter();
    mediaEmitter: EventEmitter<any> = new EventEmitter();
    closeEmmiter: EventEmitter<any> = new EventEmitter();
    ownMediaEmmiter: EventEmitter<any> = new EventEmitter();

    constructor(@Inject(PeerService) peerService: PeerService,
        @Inject(NavigatorService) navigatorService: NavigatorService) {

        this.peerService = peerService;
        this.navigatorService = navigatorService;
    }

    start(peers: Array<number>) {
        this.acceptData();
        this.acceptMedia();
        this.getOwnMedia();

        peers.forEach(peerId => {
            this.joinData(peerId);
            this.joinMedia(peerId)
        });

        // When the page is closed or navigated way from, we close the connection - useless?
        this.navigatorService.setBeforeUnload(this.closePeerConnection);
    }

    /**
       Emits an accepted DataConnection  
    **/   
    private acceptData() {
        var peer = this.peerService.getPeer();

        peer.on('open', id => {
            this.statusEmmiter.next(this.peerService.getUserId());
        });

        peer.on('connection', conn => {
            this.dataEmitter.next(conn);
        });
    }

    /**
      Emits a DataConnection from Peer.js
    **/  
    private joinData(peerId): any {
        var connection = this.peerService.getConnection(peerId);

        connection.on('open', () => {
            this.dataEmitter.next(connection);
        });
    }

    /**
        Emits an accepted MediaConnection
    **/
    private acceptMedia() {
        var peer = this.peerService.getPeer();
        //TODO: re-factor
        peer.on('call', call => {
            this.navigatorService.getUserMedia().then(stream => {
                call.answer(stream);
                call.on('stream', stream => {
                    // HACK: Hijacking a property
                    stream.peer = call.peer;
                    this.emmitMediaStream(stream);
                });
            }, err => {
                console.error(err);
            });
        });
    }

    /**
      Emits a MediaConnection from Peer.js
    **/  
    private joinMedia(peerId): any {
        this.navigatorService.getUserMedia().then(stream => {
            var call = this.peerService.getCall(peerId, stream);

            call.on('stream', stream => {
                // HACK: Hijacking a property
                stream.peer = call.peer;
                this.emmitMediaStream(stream);
            });

        }, err => {
            console.error(err);
        });
    }

    /**
      Emits own media stream
    **/
    private getOwnMedia() {
        this.navigatorService.getUserMedia().then(stream => {
            stream.peer = this.peerService.getId();
            this.ownMediaEmmiter.next(stream);
        });     
    }

    private emmitMediaStream(stream) {
        this.mediaEmitter.next(stream);

        // TODO: implement a faster way to detect a disconnected user
        stream.addEventListener('inactive', e => {
            this.closeEmmiter.next(e.currentTarget);
        });
    }

    private closePeerConnection(e) {
        this.peerService.destroyPeer();
    }

    getDataStream(): any {
        return this.dataEmitter;
    }

    getCallStream(): any {
        return this.mediaEmitter;
    }

    getOwnMediaStream(): any {
        return this.ownMediaEmmiter;
    }

    getCloseStream(): any {
        return this.closeEmmiter;
    }

    getStatusStream(): any {
        return this.statusEmmiter;
    }

    getRoomId(): string {
        return this.peerService.getRoomId();
    }
}