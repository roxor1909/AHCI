'use strict';

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
