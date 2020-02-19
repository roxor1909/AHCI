'use strict';

class PanelManager {

    constructor() {
        this.debugPanel = new DebugPanel();
        this.debugPanel.hide();
        this.sidePanel = new SidePanel();
        this.sidePanel.hide();
        this.centerPanel = new CenterPanel();
        this.centerPanel.hide();
        this.statsPanel = new StatsPanel();
        this.statsPanel.hide();
        this.ruleInterpreter = new RuleInterpreter();
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
            
            const state = this.ruleInterpreter.evaluateState(json);
            this.centerPanel.adaptTo(state);
            this.sidePanel.adaptTo(state);
            this.statsPanel.adaptTo(state);
            this.debugPanel.adaptTo(state, json);
        });

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
