'use strict';

class CenterPanel {

    constructor(position) {
        this.timerActive = false;
        this.position = position;
        this.height = 160;
        this.width = 400;

        this.progressGif = paper.image('static/images/wave.gif', SCREEN_WIDTH / 2 - this.width + 100, SCREEN_HEIGHT - this.height + 12, 600, 100);
        this.panel = paper.image('static/images/centerPanel.svg', SCREEN_WIDTH / 2 - this.width, SCREEN_HEIGHT - this.height, 800, 150);
        this.timer = paper.text(SCREEN_WIDTH / 2 - this.width + 558, SCREEN_HEIGHT - this.height + 80, '0:00');
        this.timer.attr({ fill: 'white', 'text-anchor': 'right', 'font-size': 60, 'font-family': 'LLPIXEL3' });
        this.progressGif.attr({
            visibility: 'hidden',
        });
        this.progressBar = paper.rect(SCREEN_WIDTH / 2 - this.width + 49, SCREEN_HEIGHT - this.height + 105, 0, 30, 0);

        this.group = paper.g(this.progressBar, this.progressGif, this.panel, this.timer);
    }

    hide() {
        this.group.attr({ visibility: 'hidden' });
    }

    adaptTo(person, position) {
        this.group.attr({ visibility: '' });

        if (person === KNOWN_PERSONS.KYLO) {
            this.progressGif.attr({ 'xlink:href': 'static/images/waveRed.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/centerPanelRed.svg' });
            this.style = 'Red';
            this.color = '#b5060d';
        } else if (person === KNOWN_PERSONS.REY || person === KNOWN_PERSONS.ANAKIN || person === KNOWN_PERSONS.LEIA || person === KNOWN_PERSONS.LUKE) {
            this.progressGif.attr({ 'xlink:href': 'static/images/waveGreen.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/centerPanelGreen.svg' });
            this.style = 'Green';
            this.color = '#19bfa9';
        } else {
            this.progressGif.attr({ 'xlink:href': 'static/images/wave.gif' });
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
        if (this.timerActive) {
            return;
        }
        this.timerActive = true;

        const diameter = 400;
        const completedGif = paper.image( `static/images/begin${this.style}.gif`, SCREEN_WIDTH / 2 - diameter / 2, SCREEN_HEIGHT / 2 - diameter / 2, diameter, diameter)
        const completedText = paper.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 150, 'READY, SET, Go!');
        completedText.attr({ fill: 'white', 'font-size': 50, 'font-family': 'LLPixel', 'text-anchor': 'middle' });
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
                fill: this.color,
            });
        };
        timer();
        this.timerUpdate = setInterval(timer, 1000);
    }

    stopTimer() {
        if (!this.timerActive) {
            return;
        }
        this.timerActive = false;

        this.progressGif.attr({
            visibility: 'hidden',
        });
        clearInterval(this.timerUpdate);

        const diameter = 400;
        const completedGif = paper.image(`static/images/end${this.style}.gif`, SCREEN_WIDTH / 2 - diameter / 2, SCREEN_HEIGHT / 2 - diameter / 2, diameter, diameter)
        const completedText = paper.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 150, 'COMPLETED');
        completedText.attr({ fill: 'white', 'font-size': 50, 'font-family': 'LLPixel', 'text-anchor': 'middle' });
        const group = paper.g(completedGif, completedText);
        setTimeout(() => {
            this.timer.attr({ text: '0:00' });
            group.animate({
                opacity: 0.0
            }, 1000, () => { group.remove(); });
        }, 5000);
    }

}
