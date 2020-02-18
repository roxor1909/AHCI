'use strict';

class CenterPanel {

    constructor() {
        this.height = 160;
        this.width = 400;

        this.progressGif = paper.image('static/images/wave.gif', SCREEN_WIDTH / 2 - this.width + 100, SCREEN_HEIGHT - this.height + 12, 600, 100);
        this.panel = paper.image('static/images/centerPanel.svg', SCREEN_WIDTH / 2 - this.width, SCREEN_HEIGHT - this.height, 800, 150);
        this.timer = paper.text(SCREEN_WIDTH / 2 - this.width + 558, SCREEN_HEIGHT - this.height + 80, '0:00');
        this.timer.attr({ fill: 'white', 'text-anchor': 'right', 'font-size': 60, 'font-family': 'LLPIXEL3' });
        this.progressGif.attr({ visibility: 'hidden' });
        this.progressBar = paper.rect(SCREEN_WIDTH / 2 - this.width + 49, SCREEN_HEIGHT - this.height + 105, 0, 30, 0);

        this.group = paper.g(this.progressBar, this.progressGif, this.panel, this.timer);
    }

    hide() {
        this.group.attr({ visibility: 'hidden' });
    }

    adaptTo(state) {

        if (state.centerPanelHidden) {
            this.hide();
            return;
        }
        this.group.attr({ visibility: '' });

        if (state.matchedPersonChanged) {
            switch (state.currentlyMatchedPerson) {
                case KNOWN_PERSONS.KYLO:
                    this.progressGif.attr({ 'xlink:href': 'static/images/waveRed.gif' });
                    this.panel.attr({ 'xlink:href': 'static/images/centerPanelRed.svg' });
                    break;
                case KNOWN_PERSONS.ANAKIN:
                case KNOWN_PERSONS.LEIA:
                case KNOWN_PERSONS.LUKE:
                case KNOWN_PERSONS.REY:
                    this.progressGif.attr({ 'xlink:href': 'static/images/waveGreen.gif' });
                    this.panel.attr({ 'xlink:href': 'static/images/centerPanelGreen.svg' });
                    break;
            }
        }

        // adapt UI to senior users
        this.fontSize = 60;
        if (state.currentlyMatchedPerson === KNOWN_PERSONS.LUKE || state.currentlyMatchedPerson === KNOWN_PERSONS.LEIA) {
            this.fontSize = 100;
            this.timer.attr({ 'x': SCREEN_WIDTH / 2 - this.width + 460, 'y': SCREEN_HEIGHT - this.height + 90 });
        } else {
            this.timer.attr({ 'x': SCREEN_WIDTH / 2 - this.width + 558, 'y': SCREEN_HEIGHT - this.height + 80 });
        }
        this.timer.attr({ 'font-size': this.fontSize });

        if (state.centerPanelPositionChanged) {
            this.moveTo(state.centerPanelCurrentPosition);
        }

        if (state.startTimer) {
            this.startTimer(state.style, state.accentColor);
        }
        if (state.stopTimer) {
            this.stopTimer(state.style);
        }

    }

    moveTo(position) {
        let distance = 0;
        if (position === POSITIONS.TOP) {
            distance = -SCREEN_HEIGHT + this.height;
        }

        this.group.animate({
            transform: `t0,${distance}`,
        }, ANIMATION_DUR_IN_MILLI, EASING);
    }

    startTimer(style, color) {
        // display GIF with text to indicate start of tooth brushing
        const diameter = 400;
        const completedGif = paper.image(`static/images/begin${style}.gif`, SCREEN_WIDTH / 2 - diameter / 2, SCREEN_HEIGHT / 2 - diameter / 2, diameter, diameter)
        const completedText = paper.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 150, 'READY, SET, GO!');
        completedText.attr({ fill: 'white', 'font-size': 50, 'font-family': 'LLPIXEL3', 'text-anchor': 'middle' });
        const group = paper.g(completedGif, completedText);
        setTimeout(() => {
            this.timer.attr({ text: '0:00' });
            group.animate({
                opacity: 0.0
            }, 1000, () => { group.remove(); });
        }, 5000);

        this.progressGif.attr({
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
            this.progressBar.attr({
                width: progressBarWidth,
                fill: color,
            });
        };
        timer();
        this.timerUpdate = setInterval(timer, 1000);
    }

    stopTimer(style) {

        this.progressGif.attr({
            visibility: 'hidden',
        });
        clearInterval(this.timerUpdate);

        // display GIF with text to indicate stop of tooth brushing
        const diameter = 400;
        const completedGif = paper.image(`static/images/end${style}.gif`, SCREEN_WIDTH / 2 - diameter / 2, SCREEN_HEIGHT / 2 - diameter / 2, diameter, diameter)
        const completedText = paper.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 150, 'COMPLETED');
        completedText.attr({ fill: 'white', 'font-size': 50, 'font-family': 'LLPIXEL3', 'text-anchor': 'middle' });
        const group = paper.g(completedGif, completedText);
        setTimeout(() => {
            this.timer.attr({ text: '0:00' });
            this.progressBar.attr({ width: 0 });
            group.animate({
                opacity: 0.0
            }, 1000, () => { group.remove(); });
        }, 5000);
    }

}
