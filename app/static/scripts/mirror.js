/**
 * Global parameters
 **/
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const CAMERA_WIDTH = 640;
const CAMERA_HEIGHT = 480;
const ANIMATION_DUR_IN_MILLI = 500;
const EASING = mina.easeinout;
const POSITIONS = Object.freeze({
    RIGHT: Symbol('right'),
    LEFT: Symbol('right'),
    BOTTOM: Symbol('bottom'),
    TOP: Symbol('top'),
});
const PERSONA = Object.freeze({
    ANAKIN: 'anakin',
    KYLO: 'kylo',
    LEIA: 'leia',
    LUKE: 'luke',
    REY: 'rey',
    UNKNOWN: 'unknown',
});

class SidePanel {

    constructor(position, username = '') {
        this.position = position;
        this.width = 350;

        let horizontalOffset = 0;
        if (position === POSITIONS.RIGHT) {
            horizontalOffset = SCREEN_WIDTH - this.width;
        }

        this.gif = paper.image('static/images/deathStarWhite.gif', 80 + horizontalOffset, 160, 200, 200);
        this.panel = paper.image('static/images/sidePanel.svg', 20 + horizontalOffset, 10, 320, SCREEN_HEIGHT - 20);
        this.text = paper.text(180 + horizontalOffset, 80, username)
        this.text.attr({ fill: 'black', 'font-size': 50, 'font-family': 'Starjedi', 'text-anchor': 'middle' });

        this.group = paper.g(this.gif, this.panel, this.text);
    }

    hide() {
        this.group.attr({ visibility: 'hidden' });
    }

    show() {
        this.group.attr({ visibility: '' });
    }

    adaptTo(persona) {
        if (persona === PERSONA.KYLO) {
            this.gif.attr({ 'xlink:href': 'static/images/deathStarRed.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/sidePanelRed.svg' });
        } else if (persona === PERSONA.REY || persona === PERSONA.ANAKIN || persona === PERSONA.LEIA || persona === PERSONA.LUKE) {
            this.gif.attr({ 'xlink:href': 'static/images/deathStarGreen.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/sidePanelGreen.svg' });
        } else {
            this.gif.attr({ 'xlink:href': 'static/images/deathStarWhite.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/sidePanel.svg' });
        }

        this.text.attr({ text: persona.toString().toLowerCase() });
    }

    moveTo(position) {
        if (this.position === position) {
            return;
        }
        this.position = position;

        let distance = 0;
        if (position === POSITIONS.LEFT) {
            distance = -SCREEN_WIDTH + this.width;
        }

        this.group.animate({
            transform: `t${distance},0`,
        }, ANIMATION_DUR_IN_MILLI, EASING);
    }

}

class CenterPanel {

    constructor(position) {
        this.position = position;
        this.height = 160;
        this.width = 400;

        this.gif = paper.image('static/images/wave.gif', SCREEN_WIDTH / 2 - this.width + 100, SCREEN_HEIGHT - this.height + 12, 600, 100);
        this.panel = paper.image('static/images/centerPanel.svg', SCREEN_WIDTH / 2 - this.width, SCREEN_HEIGHT - this.height, 800, 150);
        this.timer = paper.text(SCREEN_WIDTH / 2 - this.width + 558, SCREEN_HEIGHT - this.height + 80, '0:00');
        this.timer.attr({ fill: 'white', 'text-anchor': 'right', 'font-size': 60, 'font-family': 'LLPIXEL3' });
        this.gif.attr({
            visibility: 'hidden',
        });

        this.group = paper.g(this.gif, this.panel, this.timer);
    }

    hide() {
        this.group.attr({ visibility: 'hidden' });
    }

    show() {
        this.group.attr({ visibility: '' });
    }

    adaptTo(persona) {
        if (persona === PERSONA.KYLO) {
            this.gif.attr({ 'xlink:href': 'static/images/waveRed.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/centerPanelRed.svg' });
        } else if (persona === PERSONA.REY || persona === PERSONA.ANAKIN || persona === PERSONA.LEIA || persona === PERSONA.LUKE) {
            this.gif.attr({ 'xlink:href': 'static/images/waveGreen.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/centerPanelGreen.svg' });
        } else {
            this.gif.attr({ 'xlink:href': 'static/images/wave.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/centerPanel.svg' });
        }
    }

    moveTo(position) {
        if (this.position === position) {
            return;
        }

        let distance = 0;
        if (position === POSITIONS.TOP) {
            distance = -SCREEN_HEIGHT + this.height;
        }

        this.panel.animate({
            transform: `t0,${distance}`,
        }, ANIMATION_DUR_IN_MILLI, EASING);
        this.timer.animate({
            transform: `t0,${distance}`,
        }, ANIMATION_DUR_IN_MILLI, EASING);
        this.gif.animate({
            transform: `t0,${distance}`,
        }, ANIMATION_DUR_IN_MILLI, EASING);
    }

    startTimer() {
        this.gif.attr({
            visibility: '',
        });
        this.timer.attr({
            visibility: '',
        });
        let currentTimerValueInSeconds = 0;
        const timer = () => {
            let seconds = (currentTimerValueInSeconds % 60).toString().split('.')[0];
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            let minutes = (currentTimerValueInSeconds / 60).toString().split('.')[0];
            this.timer.attr({ text: `${minutes}:${seconds}` });
            currentTimerValueInSeconds++;
        }
        timer();
        this.timerUpdate = setInterval(timer, 1000);
    }

    stopTimer() {
        this.gif.attr({
            visibility: 'hidden',
        });
        clearInterval(this.timerUpdate);
    }

}

class DebugPanel {
    constructor() {
        this.video = document.getElementById('video');
        navigator.mediaDevices.getUserMedia({ video: { width: CAMERA_WIDTH, height: CAMERA_HEIGHT } }).then((stream) => this.video.srcObject = stream);

        this.boundingBoxCanvas = document.getElementById('recognition-canvas');
        this.boundingBoxCanvas.width = CAMERA_WIDTH;
        this.boundingBoxCanvas.height = CAMERA_HEIGHT;
        this.debugText = document.querySelector('#debug-text pre')

        this.debugPanel = paper.image('static/images/debugPanel.svg', SCREEN_WIDTH - 400, 290, 400, 800);
        this.webcam = paper.image('static/images/webcamPanel.svg', SCREEN_WIDTH - 1000, 10, 1000, 300);
        this.gif = paper.image('static/images/fingerprintYellow.gif', SCREEN_WIDTH - 870, 80, 230, 150);

        this.group = paper.g(this.debugPanel, this.webcam, this.gif);

        this.show();
    }

    hide() {
        this.visible = false;
        this.group.attr({ visibility: 'hidden' });
        this.boundingBoxCanvas.style.display = 'none';
        this.video.style.display = 'none';
        this.debugText.style.display = 'none';
    }

    show() {
        this.visible = true;
        this.group.attr({ visibility: '' });
        this.boundingBoxCanvas.style.display = 'block';
        this.video.style.display = 'block';
        this.debugText.style.display = 'block';
    }

    displayDebugInfo(json) {
        if (!this.visible) {
            return;
        }

        this.debugText.innerHTML = JSON.stringify(json, undefined, 2);

        const boundingBoxCanvasContext = this.boundingBoxCanvas.getContext('2d');
        boundingBoxCanvasContext.clearRect(0, 0, CAMERA_WIDTH, CAMERA_HEIGHT);

        json.boundingBoxes.forEach(el => {
            if (el['class'] !== 'person') {
                return;
            }

            const bb = el['bounding_box'];
            const xDist = bb['xmax'] - bb['xmin'];
            const yDist = bb['ymax'] - bb['ymin'];

            boundingBoxCanvasContext.strokeStyle = "#FF9900";
            boundingBoxCanvasContext.lineWidth = 5;
            boundingBoxCanvasContext.beginPath();
            boundingBoxCanvasContext.rect(bb['xmin'], bb['ymin'], xDist, yDist);
            boundingBoxCanvasContext.stroke();
        });
    }

}

class PanelManager {

    constructor() {
        this.debug = new DebugPanel();
        this.sidePanel = new SidePanel(POSITIONS.RIGHT);
        this.centerPanel = new CenterPanel();

        this.sidePanel.hide();
        this.sidePanel.adaptTo(PERSONA.KYLO);
        this.centerPanel.adaptTo(PERSONA.KYLO);
        this.centerPanel.hide();

        setTimeout(() => {
            this.debug.hide();
            this.sidePanel.show();
            this.centerPanel.show();
            this.sidePanel.moveTo(POSITIONS.LEFT);
            this.sidePanel.adaptTo(PERSONA.ANAKIN);
            this.centerPanel.adaptTo(PERSONA.ANAKIN);
            this.centerPanel.startTimer();
        }, 4000);
        setTimeout(() => {
            this.centerPanel.moveTo(POSITIONS.TOP);
        }, 6000);
        setTimeout(() => {
            this.sidePanel.moveTo(POSITIONS.RIGHT);
            this.sidePanel.adaptTo(PERSONA.KYLO);

            this.centerPanel.moveTo(POSITIONS.BOTTOM);
            this.centerPanel.adaptTo(PERSONA.KYLO);
        }, 9000);
        setTimeout(() => {
            this.centerPanel.stopTimer();
        }, 15000);

        this.socketConnection();
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

            this.debug.displayDebugInfo(json);
            this.adaptUserInterface(json.matchedPerson);

            /*        if (json.matchedPerson) {
                        matchedPerson = matchedPerson.toLowerCase();
                    }
                    const matchedPersona = assignMatchedPersonToPersona(matchedPerson);
            
                    // debugging is automatically enabled for all faces excluding Leia, Luke, Anakin, Kylo and Rey.
                    if (matchedPersona === PERSONAS.OTHER_HUMAN) {
                        showDebugMessages(json, matchedPersona, videoCanvas, boundingBoxCanvas);
                    } else {
                        hideDebugMessages(videoCanvas, boundingBoxCanvas);
                    }
            
                    // update UI only every 5 seconds
                    if (new Date() - lastUserInterfaceUpdate > UI_UPDATE_DELAY_MS) {
                        if (matchedPerson !== lastMatchedPerson) {
                            updateUserInterface(matchedPerson, matchedPersona);
                            lastMatchedPerson = matchedPerson;
                        }
                        lastUserInterfaceUpdate = new Date();
                    }*/
        });

    }

    adaptUserInterface(matchedPerson) {
        let persona;
        for (let p in PERSONA) {
            if (matchedPerson === p) {
                persona = p;
                break;
            }
        }
        console.log(persona);
        //this.sidePanel.adaptTo(persona);
        //this.centerPanel.adaptTo(persona);
    }
}
