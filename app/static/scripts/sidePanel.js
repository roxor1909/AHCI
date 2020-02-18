'use strict';

class SidePanel {

    constructor() {
        this.width = 350;

        let horizontalOffset = SCREEN_WIDTH - this.width;

        this.gif = paper.image('static/images/deathStarWhite.gif', 80 + horizontalOffset, 190, 200, 200);
        this.panel = paper.image('static/images/sidePanel.svg', 20 + horizontalOffset, 10, 320, SCREEN_HEIGHT - 20);
        this.text = paper.text(180 + horizontalOffset, 80, '');
        this.text.attr({ fill: 'black', 'font-size': 50, 'font-family': 'Starjedi', 'text-anchor': 'middle' });

        this.group = paper.g(this.gif, this.panel, this.text);
    }

    hide() {
        this.group.attr({ visibility: 'hidden' });
    }

    adaptTo(state) {

        if(state.sidePanelHidden) {
            this.hide();
            return;
        }

        this.group.attr({ visibility: '' });

        if (state.currentlyMatchedPerson === KNOWN_PERSONS.KYLO) {
            this.gif.attr({ 'xlink:href': 'static/images/deathStarRed.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/sidePanelRed.svg' });
        } else if (state.currentlyMatchedPerson === KNOWN_PERSONS.REY || state.currentlyMatchedPerson === KNOWN_PERSONS.ANAKIN || state.currentlyMatchedPerson === KNOWN_PERSONS.LEIA || state.currentlyMatchedPerson === KNOWN_PERSONS.LUKE) {
            this.gif.attr({ 'xlink:href': 'static/images/deathStarGreen.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/sidePanelGreen.svg' });
        } else {
            this.gif.attr({ 'xlink:href': 'static/images/deathStarWhite.gif' });
            this.panel.attr({ 'xlink:href': 'static/images/sidePanel.svg' });
        }

        // adapt UI to senior users
        this.fontSize = 50;
        this.textPositionY = 80;
        if (state.currentlyMatchedPerson === KNOWN_PERSONS.LUKE || state.currentlyMatchedPerson === KNOWN_PERSONS.LEIA) {
            this.fontSize = 90;
            this.textPositionY = 102;
        }
        this.text.attr({ text: state.currentlyMatchedPerson.toString().toLowerCase(), 'font-size': this.fontSize, y: this.textPositionY });

        if (state.sidePanelPositionChanged) {
            this.moveTo(state.sidePanelCurrentPosition);
        }
    }

    moveTo(position) {
        let distance = 0;
        if (position === POSITIONS.LEFT) {
            distance = -SCREEN_WIDTH + this.width;
        }

        this.group.animate({
            transform: `t${distance},0`,
        }, ANIMATION_DUR_IN_MILLI, EASING);
    }

}
