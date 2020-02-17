'use strict';

class PanelManager {

    constructor() {
        this.debugPanel = new DebugPanel();
        this.debugPanel.hide();
        this.sidePanel = new SidePanel(POSITIONS.RIGHT);
        this.sidePanel.hide();
        this.centerPanel = new CenterPanel();
        this.centerPanel.hide();
        this.statsPanel = new StatsPanel();
        this.statsPanel.hide();
        this.socketConnection();

        this.lastIsBrushing = false;
        //this.dummyAnimation();
    }

    socketConnection() {
        this.socket = io();
        this.socket.on('connection', (socket) => {
            console.log('connected to server');
            socket.emit('camera_frame', { camerWidth: CAMERA_WIDTH, camerHeight: CAMERA_HEIGHT });
            socket.on('disconnect', () => {
                console.log('disconnected from server');
            });
        });

        setInterval(() => {
            const videoCanvas = document.getElementById('video');
            const canvas = document.createElement('canvas');
            canvas.width = videoCanvas.videoWidth;
            canvas.height = videoCanvas.videoHeight;
            canvas.getContext('2d').drawImage(videoCanvas, 0, 0);
            // returns a frame encoded in base64
            const data = canvas.toDataURL();
            this.socket.emit('camera_frame', { framedata: data });
        }, 1000);

        this.socket.on('response_message', (msg) => {
            const json = JSON.parse(msg);
            this.adaptUserInterface(json.matchedPerson, json.isBrushing);
            this.debugPanel.displayDebugInfo(json);
            /*if (json.matchedPerson) {
              matchedPerson = matchedPerson.toLowerCase();
              }
              const matchedPersona = assignMatchedPersonToPersona(matchedPerson);
            */
        });

    }

    adaptUserInterface(matchedPerson, isBrushing) {
        if (isBrushing) {
            console.log('start timer for toothbrushing');
            this.centerPanel.startTimer();
        } else {
            console.log('stop timer for toothbrushing');
            this.centerPanel.stopTimer();
        }

        // prevent continuous refreshing of UI when person in front of mirror is the same person as last time
        if (this.lastMatchedPerson === matchedPerson) {
            return;
        }

        this.lastMatchedPerson = matchedPerson;
        this.centerPanel.stopTimer();

        if (matchedPerson === null || matchedPerson === undefined) {
            console.log('no person -> blank screen');
            this.debugPanel.hide();
            this.centerPanel.hide();
            this.sidePanel.hide();
            this.statsPanel.hide();
            return;
        }

        if (matchedPerson === KNOWN_PERSONS.UNKNOWN) {
            console.log('unknown person -> enable debug');
            this.debugPanel.show();
            this.centerPanel.hide();
            this.sidePanel.hide();
            this.statsPanel.hide();
            return;
        }


        for (let p in KNOWN_PERSONS) {
            if (matchedPerson === KNOWN_PERSONS[p]) {
                console.log(`matched ${p} -> adapt UI`);
                this.debugPanel.hide();
                this.centerPanel.adaptTo(KNOWN_PERSONS[p], POSITIONS.BOTTOM);
                this.sidePanel.adaptTo(KNOWN_PERSONS[p], POSITIONS.RIGHT);
                this.statsPanel.adaptTo(KNOWN_PERSONS[p], POSITIONS.RIGHT);
                break;
            }
        }
    }

    dummyAnimation() {
        this.debugPanel.show();
        this.sidePanel.hide();
        this.centerPanel.hide();
        this.statsPanel.hide();

        setTimeout(() => {
            this.debugPanel.hide();
            this.sidePanel.adaptTo(KNOWN_PERSONS.ANAKIN, POSITIONS.LEFT);
            this.centerPanel.adaptTo(KNOWN_PERSONS.ANAKIN);
            this.centerPanel.startTimer();
            this.statsPanel.adaptTo(KNOWN_PERSONS.ANAKIN, POSITIONS.LEFT);
        }, 4000);
        setTimeout(() => {
            this.centerPanel.adaptTo(KNOWN_PERSONS.ANAKIN, POSITIONS.TOP);
        }, 6000);
        setTimeout(() => {
            this.sidePanel.adaptTo(KNOWN_PERSONS.KYLO, POSITIONS.RIGHT);
            this.centerPanel.adaptTo(KNOWN_PERSONS.KYLO, POSITIONS.BOTTOM);
            this.statsPanel.adaptTo(KNOWN_PERSONS.KYLO, POSITIONS.RIGHT);
        }, 9000);
        setTimeout(() => {
            this.centerPanel.stopTimer();
        }, 15000);
    }
}
