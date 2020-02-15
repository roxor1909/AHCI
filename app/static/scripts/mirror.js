/**
 * Global parameters
 **/
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const ANIMATION_DUR_IN_MILLI = 500;
const EASING = mina.easeinout;
const POSITIONS = Object.freeze({
    RIGHT: Symbol('right'),
    LEFT: Symbol('right'),
    BOTTOM: Symbol('bottom'),
    TOP: Symbol('top'),
});
const PERSONA = Object.freeze({
    ANAKIN: Symbol('Anakin'),
    KYLO: Symbol('Kylo'),
    LEIA: Symbol('Leia'),
    LUKE: Symbol('Luke'),
    REY: Symbol('Rey'),
});

class SidePanel {

    constructor(position, username = '', showDebug = false) {
        this.position = position;
        this.width = 350;

        let horizontalOffset = 0;
        if (position === POSITIONS.RIGHT) {
            horizontalOffset = SCREEN_WIDTH - this.width;
        }

        this.video = document.getElementById('video');
        navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } }).then((stream) => this.video.srcObject = stream);
        this.gif = paper.image('static/images/deathStarWhite.gif', 60 + horizontalOffset, 160, 200, 200);
        this.panel = paper.image('static/images/sidePanel.svg', 0 + horizontalOffset, 10, 320, SCREEN_HEIGHT - 20);
        this.text = paper.text(160 + horizontalOffset, 80, username)
        this.text.attr({ fill: 'black', 'font-size': 50, 'font-family': 'Starjedi', 'text-anchor': 'middle' });

        if (showDebug === true) {
            this.showDebug();
        } else {
            this.hideDebug();
        }
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

        this.text.attr({ text: persona.description.toString().toLowerCase() });
    }

    moveTo(position) {
        if (this.position === position) {
            return;
        }
        this.position = position;

        let distance = 0;
        if (position === POSITIONS.LEFT) {
            this.video.style.left = '2.5rem';
            this.video.style.right = null;
            distance = -SCREEN_WIDTH + this.width;
        } else if (position === POSITIONS.RIGHT) {
            this.video.style.left = null;
            this.video.style.right = '4.4rem';
        }

        this.gif.animate({
            transform: `t${distance},0`,
        }, ANIMATION_DUR_IN_MILLI, EASING);
        this.panel.animate({
            transform: `t${distance},0`,
        }, ANIMATION_DUR_IN_MILLI, EASING);
        this.text.animate({
            transform: `t${distance},0`,
        }, ANIMATION_DUR_IN_MILLI, EASING);
    }

    showDebug() {
        this.gif.attr({
            visibility: 'hidden'
        });
        this.video.style.display = 'block';
    }

    hideDebug() {
        this.gif.attr({
            visibility: ''
        });
        this.video.style.display = 'none';
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

class PanelManager {

    constructor() {
        this.sidePanel = new SidePanel(POSITIONS.RIGHT);
        this.centerPanel = new CenterPanel();

        //paper.image('static/images/badgeTrooper.svg', SCREEN_WIDTH / 2 - 150, SCREEN_HEIGHT / 2 - 150, 300, 300);
        //paper.image('static/images/stormtrooperGreen.png', 110 + horizontalOffset, 400, 100, 100);
        //sidePanel.showDebug();
        this.sidePanel.adaptTo(PERSONA.KYLO);
        this.centerPanel.adaptTo(PERSONA.KYLO);

        /*        setTimeout(() => {
                    sidePanel.hideDebug();
                    sidePanel.moveTo(POSITIONS.LEFT);
                    sidePanel.adaptTo(PERSONA.ANAKIN);
                    centerPanel.adaptTo(PERSONA.ANAKIN);
                    centerPanel.startTimer();
                }, 2000);
                setTimeout(() => {
                    centerPanel.moveTo(POSITIONS.TOP);
                }, 5000);
                setTimeout(() => {
                    sidePanel.moveTo(POSITIONS.RIGHT);
                    sidePanel.adaptTo(PERSONA.KYLO);
        
                    centerPanel.moveTo(POSITIONS.BOTTOM);
                    centerPanel.adaptTo(PERSONA.KYLO);
                }, 8000);
                setTimeout(() => {
                    centerPanel.stopTimer();
                }, 15000);*/
    }

    adaptTo(persona) {
        this.sidePanel.adaptTo(persona);
        this.centerPanel.adaptTo(persona);
    }

}

const paper = Snap('#svg');
new PanelManager();
