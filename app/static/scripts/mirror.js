/**
 * Global parameters
 **/
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const CAMERA_WIDTH = 640;
const CAMERA_HEIGHT = 480;
const ANIMATION_DUR_IN_MILLI = 500;
const IDEAL_TOOTHBRUSH_DURATION = 180;
const EASING = mina.easeinout;
const POSITIONS = Object.freeze({
    RIGHT: Symbol('right'),
    LEFT: Symbol('right'),
    BOTTOM: Symbol('bottom'),
    TOP: Symbol('top'),
});
const KNOWN_PERSONS = Object.freeze({
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

    adaptTo(person, position) {
        this.group.attr({ visibility: '' });

        if (person === KNOWN_PERSONS.KYLO) {
            this.gif.attr({ 'xlink:href': 'static/images/deathStarRed.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/sidePanelRed.svg' });
        } else if (person === KNOWN_PERSONS.REY || person === KNOWN_PERSONS.ANAKIN || person === KNOWN_PERSONS.LEIA || person === KNOWN_PERSONS.LUKE) {
            this.gif.attr({ 'xlink:href': 'static/images/deathStarGreen.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/sidePanelGreen.svg' });
        } else {
            this.gif.attr({ 'xlink:href': 'static/images/deathStarWhite.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/sidePanel.svg' });
        }

        this.text.attr({ text: person.toString().toLowerCase() });

        this.moveTo(position);
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
        this.progressBar = paper.rect(SCREEN_WIDTH / 2 - this.width + 49, SCREEN_HEIGHT - this.height + 105, 0, 30, 0);

        this.group = paper.g(this.progressBar, this.gif, this.panel, this.timer);
    }

    hide() {
        this.group.attr({ visibility: 'hidden' });
    }

    adaptTo(person, position) {
        this.group.attr({ visibility: '' });

        if (person === KNOWN_PERSONS.KYLO) {
            this.gif.attr({ 'xlink:href': 'static/images/waveRed.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/centerPanelRed.svg' });
            this.color = '#b5060d';
        } else if (person === KNOWN_PERSONS.REY || person === KNOWN_PERSONS.ANAKIN || person === KNOWN_PERSONS.LEIA || person === KNOWN_PERSONS.LUKE) {
            this.gif.attr({ 'xlink:href': 'static/images/waveGreen.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/centerPanelGreen.svg' });
            this.color = '#19bfa9';
        } else {
            this.gif.attr({ 'xlink:href': 'static/images/wave.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/centerPanel.svg' });
        }

        this.moveTo(position);
    }

    moveTo(position) {
        if (this.position === position) {
            return;
        }

        let distance = 0;
        if (position === POSITIONS.TOP) {
            distance = -SCREEN_HEIGHT + this.height;
        }

        this.group.animate({
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

            const progress = Math.min(currentTimerValueInSeconds / IDEAL_TOOTHBRUSH_DURATION, 1);
            const progressBarWidth = 442 * progress;
            this.progressBar.animate({
                width: progressBarWidth,
                fill: this.color,
            }, 1100, mina.backout);
        };
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

        this.debugPanel = paper.image('static/images/debugPanel.svg', SCREEN_WIDTH - 400, 310, 400, 800);
        this.webcam = paper.image('static/images/webcamPanel.svg', SCREEN_WIDTH - 1000, 10, 1000, 300);
        this.gif = paper.image('static/images/fingerprintYellow.gif', SCREEN_WIDTH - 870, 80, 230, 150);

        this.group = paper.g(this.debugPanel, this.webcam, this.gif);

        this.show();
    }

    hide() {
        this.group.attr({ visibility: 'hidden' });
        this.boundingBoxCanvas.style.display = 'none';
        this.video.style.display = 'none';
        this.debugText.style.display = 'none';
    }

    show() {
        this.group.attr({ visibility: '' });
        this.boundingBoxCanvas.style.display = 'block';
        this.video.style.display = 'block';
        this.debugText.style.display = 'block';
    }

    displayDebugInfo(json) {
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

class StatsPanel {
    constructor() {
    }

    /**
     * 
     * @param {*} person 
     * @param {*} position 
     * @param {boolean} forceUpdateStats Force to request new tooth brush durations from backend's database.
     */
    adaptTo(person, position, forceUpdateStats = false) {
        if (this.group) {
            this.group.attr({ visibility: '' });
        }

        let colors = ['#26A67B', '#40E5AD', '#83FFD6', '#B4FFE6'];
        if (person === KNOWN_PERSONS.KYLO) {
            colors = ['#B50900', '#E4281D', '#EA746D', '#FFC6C3'];
        }

        if (this.lastMatchedPerson === person && forceUpdateStats === false) {
            this.moveTo(position);
            return;
        }
        this.lastMatchedPerson = person;

        fetch(`/stats/${person}`)
            .then((response) => {
                return response.json();
            })
            .then((measures) => {
                this.displayGraph(measures, colors);
                this.moveTo(position);
            });
    }

    hide() {
        if (this.group) {
            this.group.attr({ visibility: 'hidden' });
        }
    }

    moveTo(position) {
        if (this.position === position) {
            return;
        }
        this.position = position;

        let distance = 0;
        if (position === POSITIONS.LEFT) {
            distance = -SCREEN_WIDTH + 350;
        }

        this.group.animate({
            transform: `t${distance},0`,
        }, ANIMATION_DUR_IN_MILLI, EASING);
    }

    displayGraph(measures, colors) {
        if (this.group) {
            this.group.remove();
        }

        let max = Math.pow(Math.max(...measures), 5);
        if (max < 0) {
            max = 1024;
        }

        const elements = [];
        const times = ['3d ago', '2d ago', '1d ago', 'today'];

        times.forEach((time, i) => {

            // if no measurement present for that day, then use default value of 5 to show a small bar
            const measure = measures.length > i ? measures[i] : 2;
            const barHeight = 35;
            const barWidth = Math.pow(measure, 5) / max * 100;
            const x = SCREEN_WIDTH - 180;
            const y = 400 + barHeight * i * 1.4;

            const bar = paper.rect(x, y, 50, 50, 5).attr({
                fill: colors[i]
            });
            bar.animate({ x: x, y: y, height: barHeight, width: barWidth }, 1100, mina.elastic);
            elements.push(bar);

            const text = paper.text(x - 80, y + barHeight / 2 + 5, time);
            text.attr({ fill: colors[i], 'font-size': 20, 'font-family': 'LLPIXEL3', 'text-anchor': 'start' });
            elements.push(text);
        });

        this.group = paper.group(...elements);
    }
}

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

        this.socket.on('response_message', (msg) => this.updateUI(msg));

    }

    updateUI(msg) {

        const json = JSON.parse(msg);
        this.adaptUserInterface(json.matchedPerson, json.isBrushing);
        if (this.debugIsEnabled) {
            this.debugPanel.displayDebugInfo(json);
        }

        /*        if (json.matchedPerson) {
                    matchedPerson = matchedPerson.toLowerCase();
                }
                const matchedPersona = assignMatchedPersonToPersona(matchedPerson);
*/
    }

    adaptUserInterface(matchedPerson, isBrushing) {
        this.debugIsEnabled = false;

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
            this.debugIsEnabled = true;
            this.debugPanel.show();
            this.centerPanel.hide();
            this.sidePanel.hide();
            this.statsPanel.hide();
            return;
        }


        for (let p in KNOWN_PERSONS) {
            if (matchedPerson === KNOWN_PERSONS[p]) {
                console.log(`matched ${p}`);
                this.centerPanel.startTimer();
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
        this.debugIsEnabled = true;
        this.sidePanel.hide();
        this.centerPanel.hide();
        this.statsPanel.hide();

        setTimeout(() => {
            this.debugPanel.hide();
            this.debugIsEnabled = false;
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
