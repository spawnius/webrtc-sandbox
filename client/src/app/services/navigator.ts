declare var navigator: any;
declare var MediaDevices: any;
declare var window: any;

export class NavigatorService {

    constructor() {
        // Assigning this as a propery of a custom object will result in a TypeError, thus re-assigning of the global
        navigator.getUserMedia = (
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            MediaDevices.getUserMedia() ||
            navigator.msGetUserMedia 
        );
    }

    //TODO: optional arguments for video and audio
    getUserMedia(): Promise<any> {
        var streamPromise = new Promise<any>((resolve, reject) => {
            navigator.getUserMedia({ video: true, audio: true },
                stream => {
                    resolve(stream);
                },
                error  => {
                    reject(error);
                });
        });

        return streamPromise;    
    }

    createObjectURL(stream): string {
        let windowURL = window.URL || window.webkitURL;
        return windowURL.createObjectURL(stream);
    }

    setBeforeUnload(callback: Function) {
        window.addEventListener('beforeunload', (e) => {
            callback(e);
        });
    }
}